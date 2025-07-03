import { writeFileSync } from 'node:fs'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from '../app.module'
import { generateSwaggerDocument } from './generateSwaggerDocument'

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const document = generateSwaggerDocument(app)

  writeFileSync('swagger.json', JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  })
})()
