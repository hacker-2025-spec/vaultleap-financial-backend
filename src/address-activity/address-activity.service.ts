import type { AlchemyAssetTransfer, AlchemyWebhookEventActivity } from '../alchemy/alchemy.types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { CreateAddressActivityDto } from './dto/create-address-activity.dto'
import { createRecord, getRecord, queryRecords } from '../utils/dynamoDbHelpers'
import { DataMapper } from '@nova-odm/mapper'
import { AddressActivityEntity } from './entities/address-activity.entity'

@Injectable()
export class AddressActivityService {
  constructor(@Inject(DataMapper) protected dataMapper: DataMapper) {}

  async create(createAddressActivityDto: CreateAddressActivityDto) {
    Logger.log(`AddressActivityService => create => creating activites [${createAddressActivityDto.event.activity}]`)
    try {
      await Promise.all(
        createAddressActivityDto.event.activity.map((activity) =>
          createRecord(
            this.dataMapper,
            new AddressActivityEntity({
              fromAddress: activity.fromAddress,
              toAddress: activity.toAddress,
              blockNum: activity.blockNum,
              value: activity.value,
              createdAt: new Date(Date.parse(createAddressActivityDto.createdAt)) as unknown as string,
              asset: activity.category || '',
              hash: activity.hash,
              rawContract: {
                value: activity.rawContract?.rawValue,
                address: activity.rawContract?.address,
                decimal: activity.rawContract?.decimals,
              },
            }),
            AddressActivityEntity
          )
        )
      )

      Logger.log('AddressActivityService => create => Activities successfully created')
    } catch (error) {
      Logger.error(error)
      throw new Error(error)
    }

    return true
  }

  async init() {
    await createRecord<AddressActivityEntity>(this.dataMapper, new AddressActivityEntity({ id: '0' }), AddressActivityEntity)
  }

  async initialized(): Promise<boolean> {
    try {
      await getRecord<AddressActivityEntity>(this.dataMapper, '0', AddressActivityEntity)

      return true
    } catch {
      return false
    }
  }

  async find(toAddress: string) {
    Logger.log(`AddressActivityService => find => getting activities for "${toAddress}"`)
    try {
      const records = await queryRecords<AddressActivityEntity>(
        this.dataMapper,
        { toAddress: toAddress.toLowerCase() },
        { indexName: 'toAddressIndex' },
        AddressActivityEntity
      )

      Logger.log(`AddressActivityService => find => return value ${JSON.stringify(records)}`)
      return records
    } catch (error) {
      Logger.error(error)
      throw new Error(error)
    }
  }
}
