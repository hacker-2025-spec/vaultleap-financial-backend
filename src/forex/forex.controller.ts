import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ForexService } from './forex.service'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'
import { ForexRatesResponseDto } from './dto/forex-rates.dto'
import type { ForexRatesCache } from './interfaces/forex.interface'

@ApiTags('forex')
@Controller('forex')
export class ForexController {
  constructor(private readonly forexService: ForexService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get current forex rates from cache' })
  @ApiResponse({ status: 200, description: 'Current forex rates' })
  async getForexRates(): Promise<ForexRatesCache | null> {
    return this.forexService.getForexRates()
  }

  @Get('user/rates')
  @UseGuards(BaseUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current forex rates for authenticated users (USD and EUR)' })
  @ApiResponse({ status: 200, description: 'Current forex rates for authenticated users', type: ForexRatesResponseDto })
  async getUserForexRates(@UserContext() user: UsersEntity): Promise<ForexRatesCache | null> {
    return this.forexService.getForexRates()
  }

  @Post('fetch')
  @ApiOperation({ summary: 'Manually fetch and update forex rates' })
  @ApiResponse({ status: 200, description: 'Forex rates updated successfully' })
  async fetchForexRates(): Promise<{ message: string }> {
    await this.forexService.fetchAndStoreForexRates()
    return { message: 'Forex rates updated successfully' }
  }
}
