import { Module } from '@nestjs/common'

import { ShareholdersClaimAccountsService } from './shareholders-claim-accounts.service'

@Module({
  providers: [ShareholdersClaimAccountsService],
  exports: [ShareholdersClaimAccountsService],
})
export class ShareholdersClaimAccountsModule {}
