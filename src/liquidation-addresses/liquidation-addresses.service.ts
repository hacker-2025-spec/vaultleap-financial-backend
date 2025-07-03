import { DataMapper } from '@nova-odm/mapper'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'

import { MSG } from '../consts/exceptions-messages'
import { LiquidationAddressEntity } from './liquidation-addresses.entity'
import type { CreateLiquidationAddressResponseDTO } from '../bridge-xyz/bridge-xyz.dto'
import { queryRecords } from '../utils/dynamoDbHelpers'

@Injectable()
export class LiquidationAddressesService {
  private readonly logger = new Logger(LiquidationAddressesService.name)
  public constructor(@Inject(DataMapper) protected dataMapper: DataMapper) {}

  async saveLiquidationAddress(
    auth0Id: string,
    liquidationAddress: CreateLiquidationAddressResponseDTO,
    vaultName: string
  ): Promise<LiquidationAddressEntity> {
    this.logger.log(`LiquidationAddressesService -> saveLiquidationAddress`, {
      auth0Id,
      liquidationAddress,
      vaultName,
    })
    let currentLiqAddress = await this.dataMapper
      .get(Object.assign(new LiquidationAddressEntity(), { auth0Id, id: liquidationAddress.id }))
      .catch(() => {})

    if (!currentLiqAddress) {
      this.logger.log(
        `LiquidationAddressesService -> saveLiquidationAddress -> liquidation address with id: ${liquidationAddress.id}, is already exists for auth0Id: ${auth0Id}`
      )

      currentLiqAddress = Object.assign(new LiquidationAddressEntity(), {
        ...liquidationAddress,
        auth0Id,
        vault_name: vaultName,
      })

      currentLiqAddress = await this.dataMapper.put(currentLiqAddress)
    }

    return currentLiqAddress
  }

  async getLiquidationAddressByAuth0Id(auth0Id: string): Promise<LiquidationAddressEntity[]> {
    try {
      const iterator = this.dataMapper.query(LiquidationAddressEntity, { auth0Id })

      const results = []
      for await (const record of iterator) {
        results.push(record)
      }
      return results
    } catch {
      this.logger.log(
        `LiquidationAddressesService -> getLiquidationAddressByUserId -> liquidation addresses for auth0Id: ${auth0Id} not found`
      )
      throw new BadRequestException(MSG.LIQUIDATION_ADDRESSES_NOT_FOUND)
    }
  }

  async getLiquidationAddressById(auth0Id: string, id: string): Promise<LiquidationAddressEntity> {
    try {
      return await this.dataMapper.get(Object.assign(new LiquidationAddressEntity(), { auth0Id, id }))
    } catch {
      this.logger.log(
        `LiquidationAddressesService -> getLiquidationAddressById -> liquidation address for auth0Id: ${auth0Id} and id: ${id} not found`
      )
      throw new BadRequestException(MSG.LIQUIDATION_ADDRESS_NOT_FOUND)
    }
  }

  async getLiquidationAddressByIdOnly(id: string): Promise<LiquidationAddressEntity | null> {
    this.logger.log('LiquidationAddressesService -> getLiquidationAddressByIdOnly -> id', id)

    const iterator = this.dataMapper.scan(LiquidationAddressEntity, { limit: 100 }).pages()

    for await (const page of iterator) {
      const liqAddress = page.find((liquidationAddress) => liquidationAddress.id === id)

      if (liqAddress) {
        return liqAddress
      }
    }

    return null
  }

  async getLiquidationAddressByAddress(address: string): Promise<LiquidationAddressEntity | null> {
    const records = await queryRecords<LiquidationAddressEntity>(
      this.dataMapper,
      { address },
      { indexName: 'addressIndex' },
      LiquidationAddressEntity
    )

    return records[0]
  }
}
