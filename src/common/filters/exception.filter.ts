import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common'
import { Catch, HttpException, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'
import Sentry from '@sentry/nestjs'

const SENSITIVE_KEYS = new Set(['password', 'token', 'authorization', 'accessToken', 'secret', 'ssn'])

function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== 'object') return {}

  const sanitized = Object.entries(obj).reduce<Record<string, any>>((accumulator, [key, value]) => {
    const lowerKey = key.toLowerCase()

    accumulator[key] = SENSITIVE_KEYS.has(lowerKey)
      ? '[REDACTED]'
      : // eslint-disable-next-line unicorn/no-nested-ternary
        typeof value === 'object' && value !== null
        ? sanitizeObject(value)
        : value

    return accumulator
  }, {})

  return sanitized as Partial<T>
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception instanceof HttpException ? exception.getStatus() : 500
    const message = exception instanceof HttpException ? exception.getResponse() : (exception as any)?.message || 'Internal server error'

    const sanitizedBody = sanitizeObject(request.body)
    const sanitizedQuery = sanitizeObject(request.query)
    const sanitizedParams = sanitizeObject(request.params)
    const sanitizedHeaders = sanitizeObject(request.headers)

    const { method } = request
    const { url } = request

    // 🚫 Skip logging and Sentry for known noise
    const shouldSkipLogging = url === '/favicon.ico' || (status === 404 && method === 'GET' && url === '/favicon.ico')

    if (shouldSkipLogging) {
      response.status(status).json(message)
      return
    }

    // Log error locally
    this.logger.error(`[${method}] ${url} - Status: ${status} - Message: ${JSON.stringify(message)}`)

    // Report to Sentry
    Sentry.captureException(exception, {
      extra: {
        url,
        method: request.method,
        query: sanitizedQuery,
        params: sanitizedParams,
        body: sanitizedBody,
        headers: sanitizedHeaders,
      },
    })

    response.status(status).json({ message: 'Internal Server Error' })
  }
}
