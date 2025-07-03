import { v4 as uuid } from 'uuid'

import { DataMapper } from '@nova-odm/mapper'
import { Inject, Injectable, Logger } from '@nestjs/common'

import { CustomerEntity } from './customers.entity'
import type { BridgeCustomerResponseDto } from '../bridge-xyz/bridge-xyz.dto'
import { replaceNullsWithEmptyStrings } from '../utils/helpers'

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name)
  public constructor(@Inject(DataMapper) protected dataMapper: DataMapper) {}

  async create(auth0Id: string, { id, ...customerInfo }: BridgeCustomerResponseDto): Promise<CustomerEntity> {
    try {
      this.logger.log(`CustomersService -> saveCustomer auth0Id: ${auth0Id}`, customerInfo)
      const newCustomer = Object.assign(new CustomerEntity(), {
        auth0Id,
        bridgeCustomerId: id,
        id: uuid(),
        ...replaceNullsWithEmptyStrings(customerInfo),
      })

      return await this.dataMapper.put(newCustomer)
    } catch (error) {
      this.logger.error(`CustomersService -> saveCustomer auth0Id: ${auth0Id}`, error)
      throw error
    }
  }

  async getCustomerByAuth0Id(auth0Id: string): Promise<CustomerEntity | null> {
    try {
      this.logger.log(`CustomersService -> getCustomerByAuth0Id auth0Id: ${auth0Id}`)
      return await this.dataMapper.get(Object.assign(new CustomerEntity(), { auth0Id }))
    } catch (error) {
      this.logger.error(`CustomersService -> getCustomerByAuth0Id auth0Id: ${auth0Id}`, error)
      return null
    }
  }

  async getCustomerByBridgeCustomerId(id: string): Promise<CustomerEntity | null> {
    const iterator = this.dataMapper.scan(CustomerEntity, { limit: 100 }).pages()

    for await (const page of iterator) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const customer = page.find((customer) => customer.bridgeCustomerId === id)

      if (customer) {
        return customer
      }
    }

    return null
  }
}
