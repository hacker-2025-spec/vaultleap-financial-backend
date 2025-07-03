import { Wallet } from 'ethers'

import { DataMapper } from '@nova-odm/mapper'
import { Inject, Injectable } from '@nestjs/common'

import { createRecord, getRecord, queryRecords } from '../utils/dynamoDbHelpers'

import { ShareHoldersClaimAccountsEntity } from './shareholders-claim-accounts.entity'
import { VaultEntity } from '../vault/vault.entity'
import { encrypt } from '../utils/crypto'

@Injectable()
export class ShareholdersClaimAccountsService {
  constructor(@Inject(DataMapper) protected dataMapper: DataMapper) {}

  async getAllShareholdersClaimAccountsByVaultId(vaultId: string): Promise<ShareHoldersClaimAccountsEntity[]> {
    return await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, ShareHoldersClaimAccountsEntity)
  }

  async createShareholderClaimAccount(email: string, vaultId: string, tokenId: number): Promise<{ address: string }> {
    const wallet = Wallet.createRandom()
    const { address, privateKey } = wallet
    const { encrypted, secretKey, iv, authTag } = await encrypt(privateKey)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await createRecord(
      this.dataMapper,
      { userEmail: email, vaultId, tokenId, address, encrypted, secretKey, iv, authTag },
      ShareHoldersClaimAccountsEntity
    )

    return { address }
  }

  async removeShareholderClaimAccountPrivateKey(email: string, vaultId: string): Promise<void> {
    const records = await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, ShareHoldersClaimAccountsEntity)
    const accountRecord = records.find((record) => record.userEmail === email)

    if (accountRecord) {
      await this.dataMapper.update(
        Object.assign(new ShareHoldersClaimAccountsEntity(), {
          id: accountRecord.id,
          userEmail: accountRecord.userEmail,
          vaultId: accountRecord.vaultId,
          tokenId: accountRecord.tokenId,
          address: accountRecord.address,
          createdAt: accountRecord.createdAt,
        })
      )
    }
  }

  async removeShareholderClaimAccountInfoByAddress(tokenAddress: string, vaultId: string) {
    const records = await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, ShareHoldersClaimAccountsEntity)
    const accountRecord = records.find((record) => record.address === tokenAddress)

    if (accountRecord) {
      await this.dataMapper.update(
        Object.assign(new ShareHoldersClaimAccountsEntity(), {
          id: accountRecord.id,
          userEmail: accountRecord.userEmail,
          vaultId: accountRecord.vaultId,
          tokenId: accountRecord.tokenId,
          address: accountRecord.address,
          createdAt: accountRecord.createdAt,
        })
      )
    }
  }

  async getInfoForShareholderClaimAccount(email: string, vaultId: string): Promise<null | { a?: string; p?: string }> {
    const records = await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, ShareHoldersClaimAccountsEntity)

    const accountRecord = records.find((record) => record.userEmail === email)
    const vaultRecord = await getRecord(this.dataMapper, vaultId, VaultEntity)
    const currentRole = vaultRecord.roles.find((role) => role.emails.includes(email))

    if (!accountRecord || !currentRole) return null

    return {
      a: currentRole.shareHolderRoleAddress || undefined,
      p: accountRecord.encrypted,
    }
  }

  async generatePrivateKeyForShareholderClaimAccount(email: string, vaultId: string): Promise<string> {
    const records = await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, ShareHoldersClaimAccountsEntity)
    const accountRecord = records.find((record) => record.userEmail === email)

    if (accountRecord) {
      await this.dataMapper.update(
        Object.assign(new ShareHoldersClaimAccountsEntity(), {
          id: accountRecord.id,
          userEmail: accountRecord.userEmail,
          vaultId: accountRecord.vaultId,
          tokenId: accountRecord.tokenId,
          address: accountRecord.address,
          createdAt: accountRecord.createdAt,
          iv: accountRecord.iv,
          secretKey: accountRecord.secretKey,
          authTag: accountRecord.authTag,
        })
      )

      return accountRecord.encrypted || ''
    }
    return ''
  }
}
