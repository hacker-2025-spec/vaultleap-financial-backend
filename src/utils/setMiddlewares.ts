import * as requestIp from 'request-ip'
import { json, urlencoded } from 'express'
import { ValidationPipe } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'

import { setRawBodyMiddlewares } from './setRawBodyMiddlewares'

export const setMiddlewares = (app: INestApplication): void => {
  setRawBodyMiddlewares(app)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ limit: '50mb', extended: true }))
  app.enableCors()
  app.use(requestIp.mw())
}
