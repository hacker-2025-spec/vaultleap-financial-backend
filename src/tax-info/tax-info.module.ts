import { forwardRef, Module } from '@nestjs/common'

import { VaultModule } from '../vault/vault.module'
import { TaxFormModule } from '../tax-form/tax-form.module'

import { TaxInfoService } from './tax-info.service'
import { TaxInfoController } from './tax-info.controller'

@Module({
  imports: [VaultModule, forwardRef(() => TaxFormModule)],
  controllers: [TaxInfoController],
  providers: [TaxInfoService],
  exports: [TaxInfoService],
})
export class TaxInfoModule {}
