import type { Request } from 'express'
import { Logger } from '@nestjs/common'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bigIntSafeToJson = (obj: any) =>
  JSON.stringify(
    obj,
    (_, value) => {
      if (typeof value === 'bigint') return value.toString()

      return value
    },
    2
  )

export function replaceNullsWithEmptyStrings(obj: any) {
  if (obj && typeof obj === 'object') {
    for (const property in obj) {
      if (property in obj) {
        if (obj[property] === null) {
          obj[property] = ''
        } else if (typeof obj[property] === 'object') {
          replaceNullsWithEmptyStrings(obj[property])
        }
      }
    }
  }
  return obj
}

export interface RawBodyRequest extends Request {
  rawBody?: string
  headers: {
    'x-webhook-signature': string
  }
}

export class Locker<T extends unknown[]> {
  private args: T | null
  private locked: boolean = false
  private fn: (...args: T) => Promise<unknown> | unknown

  constructor(fn: (...args: T) => Promise<unknown> | unknown) {
    this.fn = fn
  }

  async exec(...args: T) {
    if (this.locked) {
      this.args = args
      return
    }

    this.locked = true

    try {
      await this.fn(...args)
    } catch (error) {
      Logger.error(error)
    } finally {
      this.locked = false
      this.deffered()
    }
  }

  private deffered() {
    if (this.args) {
      const { args } = this
      this.args = null
      this.exec(...args)
    }
  }
}
