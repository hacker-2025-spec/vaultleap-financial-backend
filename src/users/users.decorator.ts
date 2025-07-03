import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'

import type { UserResponseDTO } from './users.dto'

export const UserContext = createParamDecorator((_data: unknown, context: ExecutionContext): UserResponseDTO => {
  const ctx = context.switchToHttp().getRequest()
  return ctx.user
})
