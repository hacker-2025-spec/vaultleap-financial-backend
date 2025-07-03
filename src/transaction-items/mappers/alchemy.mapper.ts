import type { AssetTransfersWithMetadataResult, Network } from 'alchemy-sdk'
import { TransactionItemEntity, TransactionSource } from '../transaction-item.entity'
import type { CreateAddressActivityDto } from '../../address-activity/dto/create-address-activity.dto'

export function mapAlchemyTransactionToTransactionItem(
  alchemyTransaction: AssetTransfersWithMetadataResult,
  network: Network
): TransactionItemEntity {
  const item = new TransactionItemEntity()
  item.source = TransactionSource.ALCHEMY
  item.id = alchemyTransaction.hash
  item.blockNum = alchemyTransaction.blockNum
  item.hash = alchemyTransaction.hash
  item.fromAddress = alchemyTransaction.from
  item.toAddress = alchemyTransaction.to || ''
  item.amount = alchemyTransaction.value || undefined
  item.erc721TokenId = alchemyTransaction.erc721TokenId
  item.erc1155Metadata = alchemyTransaction.erc1155Metadata
  item.tokenId = alchemyTransaction.tokenId
  item.currency = alchemyTransaction.asset || undefined
  item.category = alchemyTransaction.category
  item.rawContract = {
    value: alchemyTransaction.rawContract?.value,
    address: alchemyTransaction.rawContract?.address,
    decimal: Number.parseFloat(alchemyTransaction.rawContract?.decimal || '0'),
  }
  item.network = network
  item.metadata = alchemyTransaction.metadata
  item.occurredAt = new Date(alchemyTransaction.metadata.blockTimestamp).getTime()
  item.createdAt = new Date()
  item.updatedAt = new Date()

  return item
}

export function mapAlchemyWebhookEventToTransactionItems(
  createAddressActivityDto: CreateAddressActivityDto,
  network: Network
): TransactionItemEntity[] {
  return createAddressActivityDto.event.activity.map((event) => {
    const item = new TransactionItemEntity()
    item.source = TransactionSource.ALCHEMY
    item.id = event.hash
    item.blockNum = event.blockNum
    item.hash = event.hash
    item.fromAddress = event.fromAddress.toLowerCase()
    item.toAddress = event.toAddress.toLowerCase()
    item.amount = event.value
    item.currency = event.asset
    item.category = event.category
    item.erc721TokenId = event.erc721TokenId
    item.erc1155Metadata = event.erc1155Metadata
    item.rawContract = {
      value: event.rawContract?.rawValue,
      address: event.rawContract?.address,
      decimal: event.rawContract?.decimals,
    }
    item.rawData = event as Record<string, any>
    item.network = network
    item.occurredAt = new Date(createAddressActivityDto.createdAt).getTime()
    item.createdAt = new Date()
    item.updatedAt = new Date()

    return item
  })
}
