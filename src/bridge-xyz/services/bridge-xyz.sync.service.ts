/* eslint-disable no-await-in-loop */
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

import type { BridgeVirtualAccountActivityResponseDto } from '../dtos/response/bridge-virtual-account.response.dto'
import { CustomersService } from '../../customers/customers.service'
import { VirtualAccountsService } from '../../virtual-accounts/virtual-accounts.service'
import { mapVirtualAccountActivityToTransactionItem } from '../../transaction-items/mappers/bridge-virtual-account.mapper'
import { TransactionItemService } from '../../transaction-items/services/transaction-item.service'
import { RedisService } from '../../redis/redis.service'
import { BRIDGE_ACTIVITIES_LAST_SYNCED_ID_KEY } from '../../redis/keys.contants'

@Injectable()
export class BridgeXyzSyncService {
  private readonly logger = new Logger(BridgeXyzSyncService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly customerService: CustomersService,
    private readonly virtualAccountService: VirtualAccountsService,
    private readonly transactionItemService: TransactionItemService,
    private readonly redisService: RedisService
  ) {}

  private async getActivities(lastSyncedId?: string): Promise<BridgeVirtualAccountActivityResponseDto[]> {
    const url = '/v0/virtual_accounts/history'
    const params: Record<string, string | number> = {
      limit: 100,
    }

    if (lastSyncedId) {
      params.starting_after = lastSyncedId
    }

    const response = await firstValueFrom(
      this.httpService.get<{ count: number; data: BridgeVirtualAccountActivityResponseDto[] }>(url, { params })
    )

    return response?.data?.data ?? []
  }

  async syncCustomerActivities(): Promise<{ activitiesProcessed: number }> {
    let activitiesProcessed = 0
    const lastSyncedId = await this.redisService.get(BRIDGE_ACTIVITIES_LAST_SYNCED_ID_KEY)
    const activities = await this.getActivities(lastSyncedId || undefined)

    if (activities.length === 0) {
      this.logger.log('No new activities to sync.')
      return { activitiesProcessed: 0 }
    }

    for (const activity of activities.reverse()) {
      // reverse to process oldest to newest
      const customer = await this.customerService.getCustomerByBridgeCustomerId(activity.customer_id)
      if (!customer) {
        this.logger.warn(`No customer found for activity ${activity.id} with customer ID ${activity.customer_id}`)
        continue
      }

      const virtualAccount = await this.virtualAccountService.getVirtualAccountById(customer.auth0Id, activity.virtual_account_id)
      if (!virtualAccount) {
        this.logger.warn(`No virtual account found for customer ${customer.auth0Id} and activity ${activity.id}`)
        continue
      }

      const transactionItem = mapVirtualAccountActivityToTransactionItem(activity, activity.customer_id, activity.virtual_account_id)

      await this.transactionItemService.create(transactionItem)

      if (transactionItem.traceNumber) {
        await this.cleanTransactionsWithSameTraceNumber(transactionItem.traceNumber)
      }
      activitiesProcessed++
      this.logger.log(`Processed activity ID ${activity.id} and timestamp ${activity.created_at}`)
    }

    // Save the last item (oldest one in API order, newest in processing order)
    const lastActivity = activities[0] // this is the newest one in time after reversing
    if (lastActivity?.id) {
      await this.redisService.set(BRIDGE_ACTIVITIES_LAST_SYNCED_ID_KEY, lastActivity.id)
      this.logger.log(`Updated last synced ID to ${lastActivity.id}`)
    }

    return { activitiesProcessed }
  }

  private async cleanTransactionsWithSameTraceNumber(traceNumber: string) {
    const existingTransactions = await this.transactionItemService.findManyByTraceNumber(traceNumber)

    if (existingTransactions.length > 0) {
      // Find the transaction with the latest occurredAt timestamp
      const latestTransaction = existingTransactions.reduce((latest, current) =>
        current.occurredAt > latest.occurredAt ? current : latest
      )

      // Delete all transactions except the latest one
      const transactionsToDelete = existingTransactions.filter((tx) => tx.id !== latestTransaction.id)

      if (transactionsToDelete.length > 0) {
        await this.transactionItemService.deleteMany(transactionsToDelete)
        this.logger.log(`Deleted ${transactionsToDelete.length} duplicate transactions with traceNumber ${traceNumber}`)
      }
    }
  }
}
