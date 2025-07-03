import type { NestMiddleware } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import * as Sentry from '@sentry/node'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl, ip } = request
    const startTime = Date.now()

    response.on('finish', () => {
      const duration = Date.now() - startTime
      const logMessage: string = `${method} ${originalUrl} ${response.statusCode} - ${duration}ms - ${ip}`

      Logger.log(logMessage)

      Sentry.addBreadcrumb({
        category: 'request',
        message: logMessage,
        level: 'info',
      })
    })

    next()
  }
}
