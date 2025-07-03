import * as bodyParser from 'body-parser'
import type { IncomingMessage, ServerResponse } from 'node:http'

import type { INestApplication } from '@nestjs/common'
import type { NestExpressApplication } from '@nestjs/platform-express/interfaces'

const rawBodyBuffer = (
  request: IncomingMessage & { rawBody: string },
  _response: ServerResponse<IncomingMessage>,
  buf: Buffer,
  encoding: BufferEncoding
) => {
  if (buf && buf.length > 0) request.rawBody = buf.toString(encoding || 'utf8')
}

export const setRawBodyMiddlewares = (app: NestExpressApplication | INestApplication): void => {
  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }))
  app.use(bodyParser.json({ verify: rawBodyBuffer }))
}
