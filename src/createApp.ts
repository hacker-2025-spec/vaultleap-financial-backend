import { useContainer } from 'class-validator'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import type { NestApplicationOptions } from '@nestjs/common'

import { AppModule } from './app.module'
import { generateSwaggerDocument } from './utils/generateSwaggerDocument'
import { setMiddlewares } from './utils/setMiddlewares'
import { setupBullBoard } from './utils/setupBullBoard'
import { AllExceptionsFilter } from './common/filters/exception.filter'

export const createApp = async (nestOptions?: NestApplicationOptions) => {
  const app = await NestFactory.create(AppModule, nestOptions || { bodyParser: false })
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development') {
    const document = generateSwaggerDocument(app)
    SwaggerModule.setup('api', app, document)
  }

  app.useGlobalFilters(new AllExceptionsFilter())
  setMiddlewares(app)

  setupBullBoard(app)

  return app
}
