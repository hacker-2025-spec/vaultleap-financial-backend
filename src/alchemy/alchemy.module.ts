import { Module } from '@nestjs/common'
import { SecretsManagerModule } from '../secrets-manager/secrets-manager.module'
import { AlchemyWebhookController } from './alchemy.webhook.controller'
import { TransactionItemModule } from '../transaction-items/transaction-item.module'
import { CustomersService } from '../customers/customers.service'
import { AlchemyWebhookHandlerService } from './services/alchemy-webhook-handler.service'
import { AlchemyTransactionService } from './services/alchemy-transaction.service'
import { AlchemyClientService } from './services/alchemy-client.service'
import { AlchemyWebhookAdminService } from './services/alchemy-webhook-admin.service'

@Module({
  imports: [SecretsManagerModule, TransactionItemModule],
  providers: [AlchemyTransactionService, AlchemyWebhookHandlerService, AlchemyClientService, AlchemyWebhookAdminService, CustomersService],
  exports: [AlchemyTransactionService, AlchemyWebhookHandlerService, AlchemyClientService, AlchemyWebhookAdminService],
  controllers: [AlchemyWebhookController],
})
export class AlchemyModule {}
