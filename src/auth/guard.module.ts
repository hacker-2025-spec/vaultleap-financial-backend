import { Global, Module } from '@nestjs/common'

import { BaseUserGuard } from './baseUser.guard'

@Global()
@Module({
  providers: [
    {
      useClass: BaseUserGuard,
      provide: BaseUserGuard,
    },
  ],
  exports: [BaseUserGuard],
})
export class GuardModule {}
