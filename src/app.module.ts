import type { MiddlewareConsumer, NestModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SentryModule } from '@sentry/nestjs/setup'

import config from './config/config'
import { GlobalModule } from './global.module'
import { GuardModule } from './auth/guard.module'
import { AuditModule } from './audit/audit.module'
import { UsersModule } from './users/users.module'
import { VaultModule } from './vault/vault.module'
import { WalletModule } from './wallet/wallet.module'
import { EthRpcModule } from './eth-rpc/eth-rpc.module'
import { SumSubModule } from './sum-sub/sum-sub.module'
import { TaxFormModule } from './tax-form/tax-form.module'
import { TaxInfoModule } from './tax-info/tax-info.module'
import { PaymasterModule } from './paymaster/paymaster.module'
import { EmailSenderModule } from './email-sender/email-sender.module'
import { VaultsCreatorModule } from './vaults-creator/vaults-creator.module'
import { CreatorHandlerModule } from './creator-handler/creator-handler.module'
import { ContractsResolverModule } from './contractsResolver/contractsResolver.module'
import { EvmTransactionSenderModule } from './evm-transaction-sender/evm-transaction-sender.module'
import { ShareholdersClaimAccountsModule } from './shareholders-claim-accounts/shareholders-claim-accounts.module'
import { NotesModule } from './notes/notes.module'
import { DirectVaultsModule } from './direct-vaults/direct-vaults.module'
import { BankingInfoModule } from './banking-info/banking-info.module'
import { LiquidationAddressesModule } from './liquidation-addresses/liquidation-addresses.module'
import { VirtualAccountsModule } from './virtual-accounts/virtual-accounts.module'
import { PersonaModule } from './persona/persona.module'
import { AddressActivityModule } from './address-activity/address-activity.module'
import { AlchemyModule } from './alchemy/alchemy.module'
import { BullmqModule } from './bullmq/bullmq.module'
import { SupportTicketModule } from './support-ticket/support-ticket.module'
import { RedisModule } from './redis/redis.module'
import { TransactionItemModule } from './transaction-items/transaction-item.module'
import { ForexModule } from './forex/forex.module'
import { HealthModule } from './health/health.module'
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware'

console.log(process.env)
@Module({
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true, ignoreEnvFile: true }),
    SentryModule.forRoot(),
    BullmqModule,
    UsersModule,
    TaxFormModule,
    TaxInfoModule,
    EmailSenderModule,
    CreatorHandlerModule,
    GlobalModule,
    GuardModule,
    EthRpcModule,
    EvmTransactionSenderModule,
    ShareholdersClaimAccountsModule,
    WalletModule,
    ContractsResolverModule,
    SumSubModule,
    VaultsCreatorModule,
    PaymasterModule,
    AuditModule,
    NotesModule,
    DirectVaultsModule,
    BankingInfoModule,
    LiquidationAddressesModule,
    VirtualAccountsModule,
    VaultModule,
    PersonaModule,
    AddressActivityModule,
    AlchemyModule,
    SupportTicketModule,
    RedisModule,
    TransactionItemModule,
    ForexModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*')
  }
}
