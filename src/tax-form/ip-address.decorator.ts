import * as requestIp from 'request-ip'

import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'

export const IpAddress = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const ctx = context.switchToHttp().getRequest()
  return requestIp.getClientIp(ctx)
})
