import { DataMapper } from '@nova-odm/mapper'
import { Inject, Injectable } from '@nestjs/common'

import type { TransactionItemEntity } from '../../transaction-items/transaction-item.entity'
import { UsersEntity } from '../../users/users.entity'
import { AlchemyClientService } from './alchemy-client.service'
import { TransactionItemService } from '../../transaction-items/services/transaction-item.service'
import { mapAlchemyTransactionToTransactionItem } from '../../transaction-items/mappers/alchemy.mapper'

@Injectable()
export class AlchemyTransactionService {
  constructor(
    private readonly transactionItemService: TransactionItemService,
    private readonly alchemyClient: AlchemyClientService,
    @Inject(DataMapper) private readonly dataMapper: DataMapper
  ) {}

  async syncTransactions(addresses: string[]) {
    const flatTransfers = []
    for (const address of addresses) {
      const transfers = await this.alchemyClient.getAssetTransfersForAddress(address)
      flatTransfers.push(...transfers)
    }
    const network = this.alchemyClient.getNetwork()
    const transactionItems = flatTransfers.map((transfer) => mapAlchemyTransactionToTransactionItem(transfer, network))

    await this.addUserAuthIdsToTransactions(transactionItems)
    await this.transactionItemService.batchUpsert(transactionItems)
  }

  async addUserAuthIdsToTransactions(items: TransactionItemEntity[]): Promise<void> {
    for (const item of items) {
      if (item.toAddress) {
        const receiver = await this.getUserByAddress(item.toAddress)
        if (receiver) item.receiverAuth0Id = receiver.auth0Id
      }
      if (item.fromAddress) {
        const sender = await this.getUserByAddress(item.fromAddress)
        if (sender) item.senderAuth0Id = sender.auth0Id
      }
    }
  }

  private async getUserByAddress(privySmartWalletAddress: string): Promise<UsersEntity | null> {
    const iterator = this.dataMapper.query(
      UsersEntity,
      { privySmartWalletAddress },
      { indexName: 'privySmartWalletAddressIndex', limit: 1 }
    )
    const { value, done: isDone } = await iterator.next()
    return isDone ? null : value
  }
}
