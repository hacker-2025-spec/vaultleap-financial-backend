import type { INestApplication } from '@nestjs/common'
import type { SwaggerDocumentOptions } from '@nestjs/swagger'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { version } from '../../getrewards-api/package.json'
import {
  CreateIbanExternalAccountDTO,
  CreateUsExternalAccountDTO,
  SourceDepositInstructionsIbanDto,
  SourceDepositInstructionsUsDto,
} from '../bridge-xyz/bridge-xyz.dto'

export const generateSwaggerDocument = (app: INestApplication) => {
  console.log('version', version)
  const config = new DocumentBuilder()
    .setTitle('Getrewards')
    .setDescription('Backend api documentation')
    .setVersion(version)
    .addBearerAuth({ type: 'http', in: 'header' })
    .build()

  const options: SwaggerDocumentOptions = {
    extraModels: [
      CreateUsExternalAccountDTO,
      CreateIbanExternalAccountDTO,
      SourceDepositInstructionsUsDto,
      SourceDepositInstructionsIbanDto,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  }

  return SwaggerModule.createDocument(app, config, options)
}
