import { ApiProperty } from '@nestjs/swagger'

export class CurrencyRateDto {
  @ApiProperty({ description: 'Rate in USD', example: 1.0 })
  usd: number

  @ApiProperty({ description: 'Rate in EUR', example: 0.91 })
  eur: number
}

export class ForexRatesResponseDto {
  @ApiProperty({ description: 'USDT rates', type: CurrencyRateDto })
  usdt: CurrencyRateDto

  @ApiProperty({ description: 'USDC rates', type: CurrencyRateDto })
  usdc: CurrencyRateDto

  @ApiProperty({ description: 'EURC rates', type: CurrencyRateDto })
  eurc: CurrencyRateDto

  @ApiProperty({ description: 'Timestamp when rates were last updated', example: 1234567890 })
  lastUpdated: number
}
