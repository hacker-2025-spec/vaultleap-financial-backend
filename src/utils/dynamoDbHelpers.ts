import type { ConfigService } from '@nestjs/config'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import type { ConditionExpression } from '@nova-odm/expressions'
import { DataMapper, type QueryOptions, type ScanIterator } from '@nova-odm/mapper'
import { Logger } from '@nestjs/common'

import { AuditEntity } from '../audit/audit.entity'
import { UsersEntity } from '../users/users.entity'
import { VaultEntity } from '../vault/vault.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { ConfigKeys } from '../config/config.interface'
import { SumSubEntity } from '../sum-sub/sum-sub.entity'
import { TaxFormEntity } from '../tax-form/tax-form.entity'
import { TaxInfoEntity } from '../tax-info/tax-info.entity'
import { VaultsCreatorEntity } from '../vaults-creator/vaults-creator.entity'
import { ShareHoldersClaimAccountsEntity } from '../shareholders-claim-accounts/shareholders-claim-accounts.entity'
import { NoteEntity } from '../notes/notes.entity'
import type { PersonaEntity } from '../persona/persona.entity'
import { AddressActivityEntity } from '../address-activity/entities/address-activity.entity'
import { TransactionItemEntity } from '../transaction-items/transaction-item.entity'
import { LiquidationAddressEntity } from '../liquidation-addresses/liquidation-addresses.entity'
import { VirtualAccountEntity } from '../virtual-accounts/virtual-accounts.entity'

const logger = new Logger('DynamoDbHelpers')

export const tableEntities = {
  AuditEntity,
  UsersEntity,
  VaultEntity,
  VaultsCreatorEntity,
  WalletEntity,
  ShareHoldersClaimAccountsEntity,
  TaxFormEntity,
  SumSubEntity,
  TaxInfoEntity,
  NoteEntity,
  AddressActivityEntity,
  TransactionItemEntity,
  LiquidationAddressEntity,
  VirtualAccountEntity,
}

export type TTableEntities =
  | AuditEntity
  | UsersEntity
  | VaultEntity
  | VaultsCreatorEntity
  | WalletEntity
  | ShareHoldersClaimAccountsEntity
  | TaxFormEntity
  | SumSubEntity
  | TaxInfoEntity
  | NoteEntity
  | PersonaEntity
  | AddressActivityEntity
  | TransactionItemEntity
  | LiquidationAddressEntity
  | VirtualAccountEntity

export const createDynamoDb = () => {
  if (process.env.IS_OFFLINE === 'true') {
    const dynamodbEndpoint = process.env.DYNAMODB_ENDPOINT || 'http://dynamodb:8000'
    const client = new DynamoDBClient({
      region: 'local',
      endpoint: dynamodbEndpoint,
    })

    return {
      useValue: client,
    }
  }

  return {
    useClass: DynamoDBClient,
  }
}

export const ensureAllTablesCreated = async (dataMapper: DataMapper): Promise<void> => {
  logger.log('🔧 Ensuring all DynamoDB tables are created...\n')

  for (const [name, entity] of Object.entries(tableEntities)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await dataMapper.ensureTableExists(entity, {
        readCapacityUnits: 1,
        writeCapacityUnits: 1,
      })
      logger.log(`✅ Ensured table for "${name}"`)
    } catch (error) {
      logger.error(`❌ Error creating table for "${name}": ${error.message ? error.message : JSON.stringify(error)}`)
    }
  }

  logger.debug('\n✅ All tables are ensured.')
}

export const deleteLocalTable = async (dataMapper: DataMapper, tableName: keyof typeof tableEntities) => {
  await dataMapper.ensureTableNotExists(tableEntities[tableName])
}

export const createRecord = async <T extends TTableEntities>(dataMapper: DataMapper, data: Partial<T>, entity: new () => T): Promise<T> => {
  return await dataMapper.put(Object.assign(new entity(), data))
}

export const getAllRecords = <T extends TTableEntities>(dataMapper: DataMapper, entity: new () => T): ScanIterator<T> => {
  return dataMapper.scan(entity)
}

export const getAllRecordsAsArray = async <T extends TTableEntities>(dataMapper: DataMapper, entity: new () => T): Promise<T[]> => {
  const iterator = getAllRecords(dataMapper, entity)
  const results: T[] = []

  for await (const item of iterator) {
    results.push(item)
  }

  return results
}

export const getRecord = async <T extends TTableEntities>(dataMapper: DataMapper, id: string, entity: new () => T): Promise<T> => {
  return await dataMapper.get(Object.assign(new entity(), { id }))
}

export const queryRecords = async <T extends TTableEntities>(
  dataMapper: DataMapper,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keyCondition: ConditionExpression | Record<string, any>,
  queryOptions: QueryOptions,
  entity: new () => T
): Promise<T[]> => {
  const records = dataMapper.query(entity, keyCondition, queryOptions)
  const result: T[] = []
  for await (const record of records) {
    result.push(record)
  }
  return result
}

export const updateRecord = async <T extends TTableEntities>(dataMapper: DataMapper, id: string, data: Partial<T>, entity: new () => T) => {
  const existingRecord = getRecord(dataMapper, id, entity)
  if (!existingRecord) throw new Error(`Record with id ${id} not found`)

  const updatedRecord = Object.assign(existingRecord, data)
  return await dataMapper.update(updatedRecord)
}

export const createDataMapper = (config: ConfigService, dynamodb: DynamoDBClient) => {
  const dataMapper = new DataMapper({
    client: dynamodb,
    tableNamePrefix: `stage-`,
  })

  return dataMapper
}
