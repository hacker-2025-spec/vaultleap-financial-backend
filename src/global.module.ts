import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataMapper } from '@nova-odm/mapper'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { createDynamoDb, createDataMapper, ensureAllTablesCreated } from './utils/dynamoDbHelpers'
import { ConfigKeys, Environment } from './config/config.interface'

@Global()
@Module({
  providers: [
    {
      provide: DynamoDBClient,
      ...createDynamoDb(),
    },
    {
      useFactory: async (config: ConfigService, dynamodb: DynamoDBClient) => await createDataMapper(config, dynamodb),
      provide: DataMapper,
      inject: [ConfigService, DynamoDBClient],
    },
    {
      provide: 'DynamoBootstrapper',
      useFactory: async (configService: ConfigService, dataMapper: DataMapper) => {
        const isLocal = configService.get(ConfigKeys.ENVIRONMENT) === Environment.LOCAL
        if (isLocal) {
          await ensureAllTablesCreated(dataMapper)
        }
        return {}
      },
      inject: [ConfigService, DataMapper],
    },
  ],
  exports: [DataMapper, DynamoDBClient],
})
export class GlobalModule {}
