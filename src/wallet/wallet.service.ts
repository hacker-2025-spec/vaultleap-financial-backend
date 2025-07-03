import { DataMapper } from '@nova-odm/mapper'
import { Logger, Injectable } from '@nestjs/common'

import { createRecord } from '../utils/dynamoDbHelpers'

import { WALLET_STATUS } from './wallet.enum'
import { WalletEntity } from './wallet.entity'
import type { WalletCreationDto } from './wallet.dto'
import { WalletDto, WalletStatusDto } from './wallet.dto'

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name)
  constructor(private readonly dataMapper: DataMapper) {}

  async getWalletsByAuth0Id(auth0Id: string): Promise<WalletDto[]> {
    const iterator = this.dataMapper.scan(WalletEntity)
    const wallets: WalletDto[] = []

    for await (const record of iterator) if (record.auth0Id === auth0Id) wallets.push(Object.assign(new WalletDto(), record))

    return wallets
  }

  async getAllWalletsByAddress(address: string): Promise<WalletDto[]> {
    const iterator = this.dataMapper.scan(WalletEntity)
    const wallets: WalletDto[] = []

    for await (const record of iterator) if (record.address === address) wallets.push(Object.assign(new WalletDto(), record))

    return wallets
  }

  async checkWallet(auth0Id: string, walletConfig: WalletCreationDto): Promise<WalletStatusDto> {
    this.logger.log('checkWallet', auth0Id, JSON.stringify(walletConfig))
    const existingWalletRecords = await this.getAllWalletsByAddress(walletConfig.address)

    if (existingWalletRecords.length > 0) {
      const existingForUserWalletRecord = await this.dataMapper
        .get(Object.assign(new WalletEntity(), { auth0Id, address: walletConfig.address }))
        .catch(() => false)

      if (existingForUserWalletRecord) return Object.assign(new WalletStatusDto(), { status: WALLET_STATUS.WALLET_ALREADY_ADDED })
      return Object.assign(new WalletStatusDto(), { status: WALLET_STATUS.WALLET_BELONGS_TO_SOMEONE_ELSE })
    }

    return Object.assign(new WalletStatusDto(), { status: WALLET_STATUS.WALLET_NOT_ASSIGNED })
  }

  async createWallet(auth0Id: string, walletConfig: WalletCreationDto): Promise<WalletDto | null> {
    this.logger.log('createWallet', auth0Id, JSON.stringify(walletConfig))

    const walletRecord = await createRecord(this.dataMapper, { auth0Id, ...walletConfig }, WalletEntity)
    return Object.assign(new WalletDto(), walletRecord)
  }
}
