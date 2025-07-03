import { DataMapper } from '@nova-odm/mapper'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { v4 as uuid } from 'uuid'

import { DirectRecipientEntity } from './direct-recipient.entity'
import { MSG } from '../consts/exceptions-messages'

@Injectable()
export class DirectRecipientService {
  private readonly logger = new Logger(DirectRecipientService.name)

  constructor(@Inject(DataMapper) protected dataMapper: DataMapper) {}

  async createDirectRecipient(
    auth0Id: string,
    vaultName: string,
    destinationAddress: string,
    chain: string = 'base',
    currency: string = 'usdc',
    feePercentage?: string
  ): Promise<DirectRecipientEntity> {
    this.logger.log('DirectRecipientService -> createDirectRecipient', {
      auth0Id,
      vaultName,
      destinationAddress,
      chain,
      currency,
      feePercentage,
    })

    const recipientId = uuid()
    const now = new Date()

    const newDirectRecipient = Object.assign(new DirectRecipientEntity(), {
      auth0Id,
      id: recipientId,
      vaultName,
      destinationAddress,
      chain,
      currency,
      feePercentage,
      createdAt: now,
      updatedAt: now,
    })

    try {
      return await this.dataMapper.put(newDirectRecipient)
    } catch (error) {
      this.logger.error('DirectRecipientService -> createDirectRecipient -> failure', error)
      throw new BadRequestException('Failed to create direct recipient')
    }
  }

  async getDirectRecipientsByAuth0Id(auth0Id: string): Promise<DirectRecipientEntity[]> {
    try {
      const iterator = this.dataMapper.query(DirectRecipientEntity, { auth0Id })

      const results = []
      for await (const record of iterator) {
        results.push(record)
      }
      return results
    } catch {
      this.logger.log(`DirectRecipientService -> getDirectRecipientsByAuth0Id -> direct recipients for auth0Id: ${auth0Id} not found`)
      return []
    }
  }

  async getDirectRecipientById(auth0Id: string, id: string): Promise<DirectRecipientEntity> {
    try {
      return await this.dataMapper.get(Object.assign(new DirectRecipientEntity(), { auth0Id, id }))
    } catch {
      this.logger.log(
        `DirectRecipientService -> getDirectRecipientById -> direct recipient for auth0Id: ${auth0Id} and id: ${id} not found`
      )
      throw new BadRequestException(MSG.LIQUIDATION_ADDRESS_NOT_FOUND)
    }
  }

  async updateDirectRecipient(
    auth0Id: string,
    id: string,
    updates: Partial<Pick<DirectRecipientEntity, 'vaultName' | 'destinationAddress' | 'feePercentage'>>
  ): Promise<DirectRecipientEntity> {
    try {
      const existingRecipient = await this.getDirectRecipientById(auth0Id, id)

      const updatedRecipient = Object.assign(existingRecipient, {
        ...updates,
        updatedAt: new Date(),
      })

      return await this.dataMapper.put(updatedRecipient)
    } catch (error) {
      this.logger.error('DirectRecipientService -> updateDirectRecipient -> failure', error)
      throw error
    }
  }

  async deleteDirectRecipient(auth0Id: string, id: string): Promise<void> {
    try {
      const recipient = await this.getDirectRecipientById(auth0Id, id)
      await this.dataMapper.delete(recipient)
    } catch (error) {
      this.logger.error('DirectRecipientService -> deleteDirectRecipient -> failure', error)
      throw error
    }
  }

  async getByDestinationAddressList(addresses: string[]): Promise<DirectRecipientEntity[]> {
    const results: DirectRecipientEntity[] = []

    for (const address of addresses) {
      const iterator = this.dataMapper.query(
        DirectRecipientEntity,
        { destinationAddress: address },
        { indexName: 'destinationAddressIndex' }
      )

      for await (const item of iterator) {
        results.push(item)
      }
    }

    return results
  }
}
