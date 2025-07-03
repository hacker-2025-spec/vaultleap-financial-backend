import path from 'node:path'
import { Client, fetchExchange } from 'urql'

import { ConfigService } from '@nestjs/config'
import { forwardRef, Module } from '@nestjs/common'

import { AwsModule } from '../aws/aws.module'
import { AuditModule } from '../audit/audit.module'
import { VaultModule } from '../vault/vault.module'
import { TaxInfoModule } from '../tax-info/tax-info.module'
import { ConfigKeys, Environment } from '../config/config.interface'
import { EmailSenderModule } from '../email-sender/email-sender.module'

import { TaxFormService } from './tax-form.service'
import { TaxFormGenerator } from './tax-form.generator'
import { BASE_FORMS_PATH } from './base-forms-path.token'
import { TaxFormController } from './tax-form.controller'

@Module({
  providers: [
    TaxFormService,
    TaxFormGenerator,
    {
      provide: BASE_FORMS_PATH,
      useFactory: (config: ConfigService) => {
        const env = config.get<string>(ConfigKeys.ENVIRONMENT) || Environment.DEVELOPMENT
        return [Environment.DEVELOPMENT, Environment.TEST].includes(env as Environment)
          ? path.join('src', 'assets', 'forms')
          : path.join(__dirname, 'data', 'forms')
      },
      inject: [ConfigService],
    },
    {
      useFactory: (configService: ConfigService) =>
        new Client({
          url: configService.get<string>(ConfigKeys.GRAPHQL_API_URL, ''),
          exchanges: [fetchExchange],
        }),
      provide: Client,
      inject: [ConfigService],
    },
  ],
  imports: [VaultModule, AwsModule, forwardRef(() => TaxInfoModule), EmailSenderModule, AuditModule],
  exports: [TaxFormService],
  controllers: [TaxFormController],
})
export class TaxFormModule {}
