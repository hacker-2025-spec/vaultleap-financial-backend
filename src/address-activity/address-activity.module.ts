import { Module } from '@nestjs/common'
import { AddressActivityService } from './address-activity.service'
import { AddressActivityController } from './address-activity.controller'

@Module({
  controllers: [AddressActivityController],
  providers: [AddressActivityService],
  exports: [AddressActivityService],
})
export class AddressActivityModule {}
