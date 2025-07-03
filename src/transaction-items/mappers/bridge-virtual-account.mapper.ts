import type { BridgeVirtualAccountActivityResponseDto } from '../../bridge-xyz/dtos/response/bridge-virtual-account.response.dto'
import { TransactionItemEntity, TransactionSource } from '../transaction-item.entity'

export function mapVirtualAccountActivityToTransactionItem(
  activity: BridgeVirtualAccountActivityResponseDto,
  customerId: string,
  virtualAccountId: string
): TransactionItemEntity {
  const item = new TransactionItemEntity()
  item.source = TransactionSource.BRIDGE
  item.id = activity.id
  item.type = activity.type
  item.sourceEventId = activity.id
  item.customerId = customerId
  item.virtualAccountId = virtualAccountId
  item.developerFeeAmount = Number.parseFloat(activity.developer_fee_amount ?? '0') // Ensure we handle cases where fee might be undefined
  item.exchangeFeeAmount = Number.parseFloat(activity.exchange_fee_amount ?? '0') // Ensure we handle cases where fee might be undefined
  item.depositId = activity.deposit_id
  item.amount = Number.parseFloat(activity.amount ?? '0') // Ensure we handle cases where amount might be undefined
  item.currency = activity.currency ?? 'USD' // Default to USD if currency is not provided
  item.description = activity.source?.description ?? ''
  item.traceNumber = activity.source?.trace_number
  item.senderName = activity.source?.sender_name ?? ''
  item.occurredAt = new Date(activity.created_at).getTime()
  item.rawData = activity as any
  item.createdAt = new Date()
  item.updatedAt = new Date()

  return item
}
