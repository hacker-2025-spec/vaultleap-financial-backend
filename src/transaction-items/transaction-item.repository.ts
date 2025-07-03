import { Injectable } from '@nestjs/common'
import type { ScanOptions } from '@nova-odm/mapper'
import { DataMapper } from '@nova-odm/mapper'
import type { ConditionExpression } from '@nova-odm/expressions/build'
import { getRecord, queryRecords } from '../utils/dynamoDbHelpers'
import { TransactionItemEntity } from './transaction-item.entity'

@Injectable()
export class TransactionItemRepository {
  constructor(private readonly dataMapper: DataMapper) {}

  async create(item: TransactionItemEntity): Promise<TransactionItemEntity> {
    return await this.dataMapper.put(item)
  }

  async update(item: TransactionItemEntity): Promise<TransactionItemEntity> {
    return await this.dataMapper.put(item)
  }

  async getById(id: string): Promise<TransactionItemEntity | null> {
    return await getRecord(this.dataMapper, id, TransactionItemEntity)
  }

  async paginateWithFilters(options: { limit?: number; startKey?: Record<string, any>; filter?: ConditionExpression }): Promise<{
    items: TransactionItemEntity[]
    nextCursor?: Record<string, any>
  }> {
    const limit = options.limit ?? 20
    const scanOptions: ScanOptions = {
      limit,
      pageSize: limit,
      ...(options.startKey && { startKey: options.startKey }),
      ...(options.filter && { filter: options.filter }),
    }

    const iterator = this.dataMapper.scan(TransactionItemEntity, scanOptions)

    const items: TransactionItemEntity[] = []
    let lastEvaluatedKey: Record<string, any> | undefined

    for await (const item of iterator) {
      items.push(item)
      if ((iterator as any).lastKey) {
        lastEvaluatedKey = (iterator as any).lastKey
        if (items.length >= limit) break
      }
    }
    return {
      items,
      nextCursor: lastEvaluatedKey,
    }
  }

  async findByAuth0Id(auth0Id: string): Promise<TransactionItemEntity[]> {
    const iterator = this.dataMapper.scan(TransactionItemEntity, {
      filter: {
        type: 'Or',
        conditions: [
          { subject: 'senderAuth0Id', type: 'Equals', object: auth0Id },
          { subject: 'receiverAuth0Id', type: 'Equals', object: auth0Id },
        ],
      },
    })

    const items: TransactionItemEntity[] = []
    for await (const item of iterator) {
      items.push(item)
    }
    return items
  }

  async findByCustomerId(customerId: string): Promise<TransactionItemEntity[]> {
    return await queryRecords(this.dataMapper, { customerId }, {}, TransactionItemEntity)
  }

  async delete(item: TransactionItemEntity): Promise<void> {
    await this.dataMapper.delete(item)
  }

  async batchDelete(items: TransactionItemEntity[]): Promise<void> {
    for await (const _ of this.dataMapper.batchDelete(items)) {
      // add logs
    }
  }
}
