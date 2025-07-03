import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { AddressActivityService } from './address-activity.service'
import { CreateAddressActivityDto } from './dto/create-address-activity.dto'

@Controller('address-activity')
export class AddressActivityController {
  constructor(private readonly addressActivityService: AddressActivityService) {}

  @Post()
  create(@Body() createAddressActivityDto: CreateAddressActivityDto) {
    return this.addressActivityService.create(createAddressActivityDto)
  }

  @Get(':address')
  find(@Param('address') address: string) {
    return this.addressActivityService.find(address)
  }
}
