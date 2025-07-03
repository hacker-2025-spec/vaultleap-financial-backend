import { forwardRef, Module } from '@nestjs/common'

import { VirtualAccountsService } from './virtual-accounts.service'
import { DirectRecipientService } from './direct-recipient.service'
import { AwsModule } from '../aws/aws.module'
import { VirtualAccountsController } from './virtual-accounts.controller'
import { BridgeXyzModule } from '../bridge-xyz/bridge-xyz.module'
import { EmailSenderModule } from '../email-sender/email-sender.module'
import { CustomersModule } from '../customers/customers.module'
import { BankingInfoModule } from '../banking-info/banking-info.module'
import { LiquidationAddressesModule } from '../liquidation-addresses/liquidation-addresses.module'
import { SecretsManagerModule } from '../secrets-manager/secrets-manager.module'
import { AlchemyModule } from '../alchemy/alchemy.module'
import { BridgeKYCModule } from '../bridge-kyc/bridge-kyc.module'

@Module({
  providers: [VirtualAccountsService, DirectRecipientService],
  imports: [
    AwsModule,
    EmailSenderModule,
    CustomersModule,
    BankingInfoModule,
    LiquidationAddressesModule,
    forwardRef(() => BridgeXyzModule),
    SecretsManagerModule,
    AlchemyModule,
    BridgeKYCModule,
  ],
  exports: [VirtualAccountsService, DirectRecipientService],
  controllers: [VirtualAccountsController],
})
export class VirtualAccountsModule {}
