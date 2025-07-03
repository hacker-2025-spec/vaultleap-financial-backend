import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataMapper } from '@nova-odm/mapper'
import type { ConditionExpression } from '@nova-odm/expressions/build'
import { TransactionItemEntity } from '../transaction-item.entity'
import { queryRecords } from '../../utils/dynamoDbHelpers'
import {
  TypeFilter,
  type GetTransactionItemsQueryDto,
  type GetTransactionItemsResponseDto,
  type TransactionItemResponseDto,
} from '../dto/transaction-item.dto'
import { TransactionItemRepository } from '../transaction-item.repository'
import { UsersEntity } from '../../users/users.entity'
import { mapTransactionItems } from '../mappers/transaction-item.mapper'
import { DirectRecipientService } from '../../virtual-accounts/direct-recipient.service'

@Injectable()
export class TransactionItemService {
  private readonly logger = new Logger(TransactionItemService.name)

  constructor(
    private readonly dataMapper: DataMapper,
    private readonly transactionItemRepository: TransactionItemRepository,
    private readonly directRecipientService: DirectRecipientService
  ) {}

  async findOneById(auth0Id: string, id: string): Promise<TransactionItemResponseDto> {
    const transaction = await this.transactionItemRepository.getById(id)
    if (!transaction || auth0Id !== transaction.auth0Id) {
      throw new NotFoundException(`Transaction with ID: ${id} not found!`)
    }

    const uniqueUserIds: Set<string> = new Set()
    const uniqueDestinationAddresses: Set<string> = new Set()

    if (transaction.senderAuth0Id) uniqueUserIds.add(transaction.senderAuth0Id)
    if (transaction.receiverAuth0Id) uniqueUserIds.add(transaction.receiverAuth0Id)

    if (transaction.senderAuth0Id === auth0Id && transaction.toAddress && !transaction.receiverAuth0Id) {
      uniqueDestinationAddresses.add(transaction.toAddress)
    }

    // Fetch users once
    const userCache: Map<string, UsersEntity> = new Map()
    for (const userId of uniqueUserIds) {
      try {
        const user = await this.getUserById(userId)
        userCache.set(userId, user)
      } catch {
        this.logger.warn(`User not found for auth0Id: ${userId}`)
      }
    }

    const directRecipients = await this.directRecipientService.getByDestinationAddressList([...uniqueDestinationAddresses])

    const mappedTransactions = mapTransactionItems(auth0Id, [transaction], userCache, directRecipients)

    return mappedTransactions[0]
  }

  async getTransactionItemsByVirtualAccountId(
    auth0Id: string,
    virtualAccountId: string
  ): Promise<{ items: TransactionItemEntity[]; nextCursor?: Record<string, any> }> {
    const response = await this.transactionItemRepository.paginateWithFilters({
      filter: {
        type: 'And',
        conditions: [
          {
            type: 'Or',
            conditions: [
              { subject: 'senderAuth0Id', type: 'Equals', object: auth0Id },
              { subject: 'receiverAuth0Id', type: 'Equals', object: auth0Id },
            ],
          },
          { subject: 'virtualAccountId', type: 'Equals', object: virtualAccountId },
        ],
      },
    })

    return response
  }

  async getTransactionItems(auth0Id: string, query: GetTransactionItemsQueryDto): Promise<GetTransactionItemsResponseDto> {
    const filters = this.buildTransactionItemFilter(auth0Id, query)
    const startKey: Record<string, any> | undefined =
      query.cursor && typeof query.cursor === 'string' ? this.decodeCursor(query.cursor) : undefined

    const { items, nextCursor } = await this.transactionItemRepository.paginateWithFilters({
      filter: filters,
      limit: query.limit,
      startKey,
    })

    items.sort((a, b) => b.occurredAt - a.occurredAt)

    // Collect unique sender and receiver IDs
    const uniqueUserIds: Set<string> = new Set()
    const uniqueDestinationAddresses: Set<string> = new Set()

    for (const item of items) {
      if (item.senderAuth0Id) uniqueUserIds.add(item.senderAuth0Id)
      if (item.receiverAuth0Id) uniqueUserIds.add(item.receiverAuth0Id)
      if (item.senderAuth0Id === auth0Id && item.toAddress && !item.receiverAuth0Id) {
        uniqueDestinationAddresses.add(item.toAddress)
      }
    }

    // Fetch users once
    const userCache: Map<string, UsersEntity> = new Map()
    for (const userId of uniqueUserIds) {
      try {
        const user = await this.getUserById(userId)
        userCache.set(userId, user)
      } catch {
        this.logger.warn(`User not found for auth0Id: ${userId}`)
      }
    }

    const directRecipients = await this.directRecipientService.getByDestinationAddressList([...uniqueDestinationAddresses])

    const mappedTransactions = mapTransactionItems(auth0Id, items, userCache, directRecipients, query.type)
    return {
      items: mappedTransactions,
      nextCursor: nextCursor ? Buffer.from(JSON.stringify(nextCursor)).toString('base64') : null,
      count: mappedTransactions.length,
      limit: query.limit || 20,
    }
  }

  async create(item: TransactionItemEntity): Promise<TransactionItemEntity> {
    return this.transactionItemRepository.create(item)
  }

  async batchUpsert(items: TransactionItemEntity[]): Promise<void> {
    for (const item of items) {
      // eslint-disable-next-line no-await-in-loop
      await this.create(item)
    }
  }

  async deleteMany(items: TransactionItemEntity[]): Promise<void> {
    return this.transactionItemRepository.batchDelete(items)
  }

  async getTransactionItemsByAuth0Id(auth0Id: string): Promise<TransactionItemEntity[]> {
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

  async findAllByCustomer(customerId: string): Promise<TransactionItemEntity[]> {
    return await queryRecords<TransactionItemEntity>(this.dataMapper, { customerId }, {}, TransactionItemEntity)
  }

  async findManyByTraceNumber(traceNumber: string): Promise<TransactionItemEntity[]> {
    const results = await queryRecords<TransactionItemEntity>(
      this.dataMapper,
      { traceNumber },
      { indexName: 'traceNumberIndex' },
      TransactionItemEntity
    )
    return results
  }

  private buildTransactionItemFilter(auth0Id: string, query: GetTransactionItemsQueryDto): ConditionExpression {
    const filters: ConditionExpression[] = []
    // Handle direction filter
    if (query.type === TypeFilter.FUNDS_SENT) {
      filters.push({ subject: 'senderAuth0Id', type: 'Equals', object: auth0Id })
    } else if (query.type === TypeFilter.FUNDS_RECEIVED) {
      filters.push({ subject: 'receiverAuth0Id', type: 'Equals', object: auth0Id })
    } else {
      // Default: include both sent and received
      filters.push({
        type: 'Or',
        conditions: [
          { subject: 'senderAuth0Id', type: 'Equals', object: auth0Id },
          { subject: 'receiverAuth0Id', type: 'Equals', object: auth0Id },
        ],
      })
    }

    if (query.virtualAccountId) {
      filters.push({ subject: 'virtualAccountId', type: 'Equals', object: query.virtualAccountId })
    }

    if (query.source) {
      filters.push({ subject: 'source', type: 'Equals', object: query.source })
    }

    if (query.currency) {
      filters.push({ subject: 'currency', type: 'Equals', object: query.currency })
    }

    if (query.startDate) {
      filters.push({
        subject: 'occurredAt',
        type: 'GreaterThanOrEqualTo',
        object: new Date(query.startDate).getTime(),
      })
    }

    if (query.endDate) {
      filters.push({
        subject: 'occurredAt',
        type: 'LessThanOrEqualTo',
        object: new Date(query.endDate).getTime(),
      })
    }

    return filters.length === 1
      ? filters[0]
      : {
          type: 'And',
          conditions: filters,
        }
  }

  private decodeCursor(encoded: string): Record<string, any> {
    return JSON.parse(Buffer.from(encoded, 'base64').toString())
  }

  private async getUserById(auth0Id: string): Promise<UsersEntity> {
    const user = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id }))
    return user
  }
}
