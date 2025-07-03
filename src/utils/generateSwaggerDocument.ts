import type { INestApplication } from '@nestjs/common'
import type { SwaggerDocumentOptions } from '@nestjs/swagger'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const generateSwaggerDocument = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Getrewards API')
    .setDescription('Getrewards api documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', in: 'header' })
    .build()

  const options: SwaggerDocumentOptions = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  }

  const document = SwaggerModule.createDocument(app, config, options)

  return document
}
