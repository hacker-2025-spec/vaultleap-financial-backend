import type { DirectRecipientEntity } from '../../virtual-accounts/direct-recipient.entity'
import { TypeFilter } from '../dto/transaction-item.dto'
import type { TransactionItemResponseDto } from '../dto/transaction-item.dto'
import type { TransactionItemEntity } from '../transaction-item.entity'

type UserLike = {
  name?: string
  auth0Id?: string
  email?: string
  destinationAddress?: string
}
export function mapTransactionItems(
  userAuth0Id: string,
  transactionItems: TransactionItemEntity[],
  userCache: Map<string, any>,
  directRecipients: DirectRecipientEntity[],
  typeFilter?: TypeFilter
): TransactionItemResponseDto[] {
  const response: TransactionItemResponseDto[] = []

  for (const item of transactionItems) {
    let receiver = item.receiverAuth0Id
      ? userCache.get(item.receiverAuth0Id)
      : directRecipients.find((dr) => dr.destinationAddress.toLowerCase() === item.toAddress?.toLowerCase())
    let sender = item.senderAuth0Id ? userCache.get(item.senderAuth0Id) : undefined

    receiver = mapUserLikeEntity(receiver)
    sender = mapUserLikeEntity(sender)

    const isSender = item.senderAuth0Id === userAuth0Id
    const isReceiver = item.receiverAuth0Id === userAuth0Id

    if (typeFilter === TypeFilter.FUNDS_RECEIVED && isReceiver) {
      response.push({
        ...item,
        receiverUser: receiver,
        senderUser: sender,
        type: typeFilter,
        description: `Received ${item.amount} ${item.currency} `,
      })
    }

    if (typeFilter === TypeFilter.FUNDS_SENT && isSender) {
      response.push({
        ...item,
        senderUser: sender,
        receiverUser: receiver,
        type: typeFilter,
        description: `Sent ${item.amount} ${item.currency}`,
      })
    }

    if (!typeFilter && isReceiver) {
      response.push({
        ...item,
        receiverUser: receiver,
        senderUser: sender,
        type: TypeFilter.FUNDS_RECEIVED,
        description: `Received ${item.amount} ${item.currency} `,
      })
    }

    if (!typeFilter && isSender) {
      response.push({
        ...item,
        senderUser: sender,
        receiverUser: receiver,
        type: TypeFilter.FUNDS_SENT,
        description: `Sent ${item.amount} ${item.currency}`,
      })
    }
  }

  return response
}

function mapUserLikeEntity(entity: any): UserLike | undefined {
  if (!entity) return undefined

  // User from userCache
  if (entity.email || entity.name) {
    return {
      auth0Id: entity.auth0Id,
      email: entity.email,
      name: entity.name,
    }
  }

  // DirectRecipientEntity fallback
  if (entity.destinationAddress) {
    return {
      name: entity.vaultName, // 👈 vaultName mapped to name
      destinationAddress: entity.destinationAddress,
    }
  }

  return undefined
}
