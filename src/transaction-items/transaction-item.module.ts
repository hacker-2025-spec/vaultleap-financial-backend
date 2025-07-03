import { Module } from '@nestjs/common'
import { TransactionItemController } from './transaction-item.controller'
import { TransactionItemService } from './services/transaction-item.service'
import { TransactionItemRepository } from './transaction-item.repository'
import { DirectRecipientService } from '../virtual-accounts/direct-recipient.service'

@Module({
  controllers: [TransactionItemController],
  providers: [TransactionItemService, TransactionItemRepository, DirectRecipientService],
  exports: [TransactionItemService, TransactionItemRepository],
})
export class TransactionItemModule {}
