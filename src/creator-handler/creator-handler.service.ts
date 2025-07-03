import { ethers, ZeroAddress } from 'ethers'

import { DataMapper } from '@nova-odm/mapper'
import { Deployments } from '@KLYDO-io/getrewards-contracts/deployments'
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common'
import { DistributionStructureFactory__factory } from '@KLYDO-io/getrewards-contracts'

import type { VaultDto } from '../vault/vault.dto'
import { bigIntSafeToJson } from '../utils/helpers'
import { VaultEntity } from '../vault/vault.entity'
import { VaultService } from '../vault/vault.service'
import { EthRpcService } from '../eth-rpc/eth-rpc.service'
import { S3ExternalStorage } from '../aws/S3ExternalStorage'
import { EmailSenderService } from '../email-sender/email-sender.service'
import { ContractsResolverService } from '../contractsResolver/contractsResolver.service'
import type { TransactionRequestData } from '../evm-transaction-sender/evm-transaction-sender.types'
import { EvmTransactionSenderService } from '../evm-transaction-sender/evm-transaction-sender.service'
import { ShareHoldersClaimAccountsEntity } from '../shareholders-claim-accounts/shareholders-claim-accounts.entity'
import { ShareholdersClaimAccountsService } from '../shareholders-claim-accounts/shareholders-claim-accounts.service'
import { TRANSACTION_STATUS, TRANSACTION_TYPE_CREATOR } from '../evm-transaction-sender/evm-transaction-sender.types'

import { CreatorHandlerError } from './creator-handler.error'
import type { TShareOwnerStruct, TVaultCreationData } from './creator-handler.typers'
import { AlchemyClientService } from '../alchemy/services/alchemy-client.service'

@Injectable()
export class CreatorHandlerService {
  private readonly logger = new Logger(CreatorHandlerService.name)
  constructor(
    @Inject(EmailSenderService) private emailSenderService: EmailSenderService,
    @Inject(ShareholdersClaimAccountsService)
    private shareholdersClaimAccountService: ShareholdersClaimAccountsService,
    @Inject(DataMapper) protected dataMapper: DataMapper,
    @Inject(EvmTransactionSenderService) private evmTransactionSenderService: EvmTransactionSenderService,
    @Inject(VaultService) private vaultService: VaultService,
    @Inject(ContractsResolverService) private contractsResolverService: ContractsResolverService,
    @Inject(EthRpcService) private ethRpcService: EthRpcService,
    @Inject('Deployments') private deployments: Deployments,
    private s3ExternalStorage: S3ExternalStorage,
    private readonly alchemyClient: AlchemyClientService
  ) {}

  public async updateVaultTransactionDetails(vaultId: string, transactionHash: string | undefined, transactionStatus: TRANSACTION_STATUS) {
    const databaseRecord = await this.vaultService.getVaultById(vaultId)

    if (transactionHash) databaseRecord.transactionHash = transactionHash

    databaseRecord.transactionStatus = transactionStatus

    this.logger.log('updateVaultTransactionDetails => transactionStatus', transactionStatus)

    if (transactionStatus === TRANSACTION_STATUS.SUCCESSFUL) {
      let transactionReceipt
      if (transactionHash) transactionReceipt = await this.ethRpcService.getTransactionReceipt(transactionHash)

      // eslint-disable-next-line no-undefined
      if (transactionReceipt !== null && transactionReceipt !== undefined) {
        const vaultAddress = this.contractsResolverService.findDistributionAddress(transactionReceipt)
        databaseRecord.shareholderManagerAddress = this.contractsResolverService.findShareRolesManagerAddresses(transactionReceipt)!

        if (vaultAddress) {
          try {
            await this.alchemyClient.updateWebhook([vaultAddress])
          } catch (error) {
            this.logger.error(error)
          }
        }

        this.logger.log('updateVaultTransactionDetails => vaultAddress', vaultAddress)

        if (vaultAddress) {
          databaseRecord.vaultAddress = vaultAddress
          await this.sendVaultSummary(vaultAddress, vaultId)
        }

        const addresses = this.contractsResolverService.findShareHolderVaultAddresses(transactionReceipt)
        this.logger.log('updateVaultTransactionDetails => addresses', addresses)

        const accountsByVaultId = await this.shareholdersClaimAccountService.getAllShareholdersClaimAccountsByVaultId(vaultId)
        const parsedAccountsByVaultId = []
        for (const account of accountsByVaultId) {
          parsedAccountsByVaultId.push(
            Object.assign(new ShareHoldersClaimAccountsEntity(), {
              id: account.id,
              userEmail: account.userEmail,
              vaultId: account.vaultId,
              tokenId: account.tokenId,
              address: account.address,
              createdAt: account.createdAt,
            })
          )
        }
        this.logger.log('updateVaultTransactionDetails => parsedAccountsByVaultId', parsedAccountsByVaultId)

        for (const address of addresses) {
          if (address.shareHolderVaultAddress) {
            const specificUser = parsedAccountsByVaultId.find((user) => user.address === address.shareHolderAddress)
            this.logger.log('updateVaultTransactionDetails => specificUser', JSON.stringify(specificUser))

            if (specificUser) {
              const index = databaseRecord.roles.findIndex((role) => role.emails[0] === specificUser.userEmail)
              if (index > -1) databaseRecord.roles[index].shareHolderRoleAddress = address.shareHolderVaultAddress

              const roleName = databaseRecord.roles[index]?.name || 'Shareholder'

              if (!databaseRecord.selfManaged) {
                // eslint-disable-next-line no-await-in-loop
                await this.sendVaultInvitationsWithAddress(vaultId, specificUser.userEmail, address.shareHolderVaultAddress, roleName)
              }
            }
          }
        }
      }
    }
    this.logger.log('updateVaultTransactionDetails => update', databaseRecord)

    await this.dataMapper.update(Object.assign(new VaultEntity(), databaseRecord))
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async encodeVaultCreationData(creationData: TVaultCreationData) {
    const parsedDistributionStartThreshold = ethers.parseUnits(String(creationData.distributionStartThreshold), 6)
    const parsedKlydoVaultFee = ethers.parseUnits(String(creationData.klydoVaultFee), 6)
    const parsedSharesDistributionPercentage = creationData.sharesDistributionPercentage.map((percentage) =>
      ethers.parseUnits(String(percentage), 6)
    )

    const functionData = [
      creationData.distributionName,
      parsedDistributionStartThreshold,
      creationData.thresholdVaultAddress || ZeroAddress,
      parsedKlydoVaultFee,
      creationData.uri,
      parsedSharesDistributionPercentage,
      creationData.shareOwners,
      creationData.walletAddress,
    ]

    this.logger.log('encodeVaultCreationData => Function Data', bigIntSafeToJson(functionData))

    const contractInterface = new ethers.Interface(DistributionStructureFactory__factory.abi)

    return contractInterface.encodeFunctionData('deployContractsStructure', functionData)
  }

  public async sendVaultCreationTransaction(creationData: TVaultCreationData, vaultId: string, taskToken?: string) {
    const encodedData = await this.encodeVaultCreationData(creationData)

    this.logger.log('sendVaultCreationTransaction => encodedData', encodedData)

    const evmTransactionRequestData: TransactionRequestData['detail'] = {
      value: '0',
      transactionType: TRANSACTION_TYPE_CREATOR.VAULT_CREATION,
      to: ethers.getAddress(this.deployments.DistributionStructureFactory),
      originOperationId: vaultId,
      origin: 'getrewards.api',
      data: encodedData,
      auth0Id: creationData.auth0Id,
      taskToken,
    }

    this.logger.log('sendVaultCreationTransaction => EVM Transaction Request Data', bigIntSafeToJson(evmTransactionRequestData))

    await this.evmTransactionSenderService.sendTransactionEvent(evmTransactionRequestData)
  }

  public async processCreatorConfigSubmission(
    vaultId: string,
    auth0Id: string,
    walletAddress: string,
    taskToken?: string
  ): Promise<VaultDto> {
    const vaultRecord = await this.vaultService.getVaultById(vaultId)

    if (!vaultRecord) throw new HttpException(CreatorHandlerError.VaultNotFound, 404)

    if (vaultRecord.transactionStatus === TRANSACTION_STATUS.SUCCESSFUL) {
      throw new HttpException(CreatorHandlerError.VaultAlreadyCreated, 400)
    }

    if (vaultRecord.transactionStatus === TRANSACTION_STATUS.SUBMITTED) {
      throw new HttpException(CreatorHandlerError.VaultCreationTransactionSubmitted, 400)
    }

    if (vaultRecord.transactionStatus === TRANSACTION_STATUS.CREATED) {
      throw new HttpException(CreatorHandlerError.VaultCreationTransactionCreated, 400)
    }

    const transformedShareOwners: TShareOwnerStruct[] = []

    for (const role of vaultRecord.roles) {
      for (const email of role.emails) {
        // eslint-disable-next-line no-await-in-loop
        const { address } = await this.shareholdersClaimAccountService.createShareholderClaimAccount(
          email,
          vaultRecord.id,
          transformedShareOwners.length
        )
        const tokenId = transformedShareOwners.length
        transformedShareOwners.push({
          tokenId,
          owner: address,
        })
        const roleNameInitials = role.name
          .split(' ')
          .map((word) => word[0])
          .join('')
        // eslint-disable-next-line no-await-in-loop
        await this.createNFTJson(tokenId.toString(), `${vaultRecord.projectName} ${roleNameInitials}`, vaultId)
      }
    }

    await this.sendVaultCreationTransaction(
      {
        uri: `https://nft.klydo.io/${vaultId}/{id}.json`,
        thresholdVaultAddress: vaultRecord.profitSwitchAddress || this.deployments.KlydoWallet,
        sharesDistributionPercentage: vaultRecord.roles.map((role) => role.sharePercentage),
        shareOwners: transformedShareOwners,
        klydoVaultFee: vaultRecord.vaultFeePercentage || 0,
        distributionStartThreshold: vaultRecord.profitSwitchAmount || 0,
        distributionName: `${vaultRecord.projectName} ${vaultId}`,
        auth0Id,
        walletAddress,
      },
      vaultRecord.id,
      taskToken
    )

    return vaultRecord
  }

  public async removePrivateKeyWhenCreationFailed(vaultId: string): Promise<void> {
    const accountsByVaultId = await this.shareholdersClaimAccountService.getAllShareholdersClaimAccountsByVaultId(vaultId)

    for await (const account of accountsByVaultId) {
      await this.shareholdersClaimAccountService.removeShareholderClaimAccountPrivateKey(account.userEmail, vaultId)
    }
  }

  public async createNFTJson(tokenId: string, name: string, vaultId: string) {
    const NFT_IMAGE_URL = 'https://nft.klydo.io/images/VaultleapNFT.gif'
    await this.s3ExternalStorage.uploadFile({
      s3Key: `${vaultId}/${tokenId.padStart(64, '0')}.json`,
      fileBody: JSON.stringify({ name, image: NFT_IMAGE_URL }),
      contentType: 'application/json',
      bucketName: 'nft.klydo.io',
    })
  }

  public async sendVaultInvitationsWithAddress(vaultId: string, email: string, address: string, roleName: string) {
    const databaseRecord = await this.dataMapper.get(Object.assign(new VaultEntity(), { id: vaultId }))

    const encryptedPrivateKey = await this.shareholdersClaimAccountService.generatePrivateKeyForShareholderClaimAccount(email, vaultId)
    await this.emailSenderService.sendShareHolderInvitationEmail(
      databaseRecord.ownerName,
      databaseRecord.projectName,
      roleName,
      email,
      databaseRecord.id,
      encryptedPrivateKey,
      address
    )
  }

  public async sendVaultSummary(vaultAddress: string | undefined, vaultId: string) {
    const databaseRecord = await this.dataMapper.get(Object.assign(new VaultEntity(), { id: vaultId }))

    if (vaultAddress) {
      await this.emailSenderService.sendOwnerSummaryEmail(
        databaseRecord.ownerName,
        vaultAddress,
        databaseRecord.projectName,
        databaseRecord.roles,
        databaseRecord.ownerEmail,
        databaseRecord.vaultFeePercentage,
        databaseRecord.profitSwitchAmount,
        databaseRecord.profitSwitchAddress,
        databaseRecord.taxFormEnabled
      )
    }
  }
}
