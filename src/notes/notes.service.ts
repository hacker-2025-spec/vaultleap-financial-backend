import { DataMapper } from '@nova-odm/mapper'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { FundsDistributor__factory } from '@KLYDO-io/getrewards-contracts'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'

import type { CreateFundingNoteDTO } from './notes.dto'
import { NoteEntity } from './notes.entity'
import { createRecord, getRecord, queryRecords } from '../utils/dynamoDbHelpers'
import { VaultEntity } from '../vault/vault.entity'
import { MSG } from '../consts/exceptions-messages'
import { EthRpcService } from '../eth-rpc/eth-rpc.service'
import { ContractsResolverService } from '../contractsResolver/contractsResolver.service'
import type { GetDataFromTransactionResults } from './notes.types'
import { EmailSenderService } from '../email-sender/email-sender.service'
import type { IConfig } from '../config/config.interface'

@Injectable()
export class NotesService {
  public constructor(
    @Inject(DataMapper) protected dataMapper: DataMapper,
    private readonly ethRpcService: EthRpcService,
    private readonly contractsResolverService: ContractsResolverService,
    private readonly emailSenderService: EmailSenderService,
    private config: ConfigService<IConfig, true>
  ) {}

  async getDistributionName(vaultAddress: string): Promise<string> {
    return new FundsDistributor__factory()
      .connect(await this.ethRpcService.getRpcProvider())
      .attach(vaultAddress)
      .getFunction('getDistributionName')
      .staticCall()
      .then((value) => value.toString())
      .catch(() => 0)
  }

  private async getDataFromTransaction(transactionHash: string): Promise<GetDataFromTransactionResults> {
    const receipt = await this.ethRpcService.getTransactionReceipt(transactionHash)

    if (!receipt) {
      throw new BadRequestException(MSG.NO_TRASACTION_RECEIPT)
    }

    const { amount, address } = this.contractsResolverService.getDataFromFundsDistributedEvent(receipt)
    const distributionName = await this.getDistributionName(address)

    const vaultIdInTransaction = distributionName.split(' ').at(-1)

    if (!vaultIdInTransaction) {
      throw new BadRequestException(MSG.VAULT_ID_NOT_FOUND)
    }

    return { vaultIdInTransaction, amount }
  }

  private async resolveVaultById(vaultId: string): Promise<VaultEntity> {
    try {
      return await getRecord(this.dataMapper, vaultId, VaultEntity)
    } catch {
      throw new BadRequestException(MSG.VAULT_NOT_FOUND)
    }
  }

  private async checkIfNoteExists(transactionHash: string): Promise<void> {
    const existingNotes = await queryRecords(this.dataMapper, { transactionHash }, {}, NoteEntity)

    if (existingNotes.length > 0) {
      throw new BadRequestException(MSG.NOTE_ALREADY_EXISTS)
    }
  }

  public getDate(): Date {
    return new Date()
  }

  private async handleSendEmails(vault: VaultEntity, amount: string, transactionHash: string, note?: string): Promise<void> {
    const etherscanUrl = this.config.get('ETHERSCAN_URL', { infer: true })

    const ownderDashboardLink = `${process.env.REDIRECT_URL}/dashboard/vaults/`
    const rolesDashboardLink = `${process.env.REDIRECT_URL}/dashboard/vaults/?claim=true`

    const promises: Promise<void>[] = [
      this.emailSenderService.sendFundsSent({
        email: vault.ownerEmail,
        fullName: vault.ownerName,
        date: dayjs(this.getDate()).format('MM/DD/YYYY'),
        transactionId: transactionHash,
        vaultName: vault.projectName,
        memo: note,
        amount: ethers.formatUnits(amount, 6),
        link: ownderDashboardLink,
        transactionLink: `${etherscanUrl}/tx/${transactionHash}`,
      }),
    ]

    const roleEmailPromises = vault.roles.flatMap((role) => {
      const receivedAmount = this.calculateReceivedAmount(amount, vault.vaultFeePercentage, role.sharePercentage)
      return role.emails.map((email) =>
        this.emailSenderService.sendFundsSent({
          email,
          fullName: role.name,
          date: dayjs(this.getDate()).format('MM/DD/YYYY'),
          transactionId: transactionHash,
          vaultName: vault.projectName,
          memo: note,
          amount: receivedAmount,
          link: rolesDashboardLink,
          transactionLink: `${etherscanUrl}/tx/${transactionHash}`,
        })
      )
    })
    promises.push(...roleEmailPromises)

    await Promise.all(promises)
  }

  async createFundingNote(auth0Id: string, { transactionHash, vaultId, note }: CreateFundingNoteDTO): Promise<NoteEntity> {
    await this.checkIfNoteExists(transactionHash)
    const vault = await this.resolveVaultById(vaultId)
    const { vaultIdInTransaction, amount } = await this.getDataFromTransaction(transactionHash)

    if (vault.id !== vaultIdInTransaction) {
      throw new BadRequestException(MSG.VAULT_IDS_NOT_MATCH)
    }

    const createdNote = createRecord(this.dataMapper, { transactionHash, note, vaultId: vault.id, userId: auth0Id }, NoteEntity)

    await this.handleSendEmails(vault, amount, transactionHash, note)

    return createdNote
  }

  calculateReceivedAmount(amountWithFeeStr: string, vaultFee: number, sharesPercentage: number): string {
    const amountWithFees = BigInt(amountWithFeeStr)

    const fee = BigInt(Math.round(vaultFee * 1_000_000))

    const originalAmount = (amountWithFees * BigInt(100_000_000)) / (BigInt(100_000_000) + fee)
    const shareAmount = (originalAmount * BigInt(Math.round(sharesPercentage * 100))) / BigInt(10_000)

    return Number(ethers.formatUnits(shareAmount, 6)).toFixed(2).toString()
  }
}
