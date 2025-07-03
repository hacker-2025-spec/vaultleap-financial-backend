import { forwardRef, Module } from '@nestjs/common'

import { DirectVaultsService } from './direct-vaults.service'
import { DirectVaultsController } from './direct-vaults.controller'
import { BridgeXyzModule } from '../bridge-xyz/bridge-xyz.module'
import { BridgeKYCModule } from '../bridge-kyc/bridge-kyc.module'
import { CustomersModule } from '../customers/customers.module'
import { BankingInfoModule } from '../banking-info/banking-info.module'
import { LiquidationAddressesModule } from '../liquidation-addresses/liquidation-addresses.module'
import { EmailSenderModule } from '../email-sender/email-sender.module'
import { UsersModule } from '../users/users.module'
import { SecretsManagerModule } from '../secrets-manager/secrets-manager.module'
import { VirtualAccountsModule } from '../virtual-accounts/virtual-accounts.module'

@Module({
  imports: [
    forwardRef(() => BridgeXyzModule),
    BridgeKYCModule,
    CustomersModule,
    BankingInfoModule,
    LiquidationAddressesModule,
    EmailSenderModule,
    UsersModule,
    SecretsManagerModule,
    forwardRef(() => VirtualAccountsModule),
  ],
  controllers: [DirectVaultsController],
  providers: [DirectVaultsService],
  exports: [DirectVaultsService],
})
export class DirectVaultsModule {}
