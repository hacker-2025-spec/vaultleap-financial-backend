import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import { ALCHEMY_TRANSACTION_SCANNER_QUEUE } from '../constants'
import { UsersService } from '../../users/users.service'
import { AlchemyTransactionService } from '../../alchemy/services/alchemy-transaction.service'

@Processor(ALCHEMY_TRANSACTION_SCANNER_QUEUE)
export class AlchemyTransactionScannerWorker extends WorkerHost {
  private readonly logger = new Logger(AlchemyTransactionScannerWorker.name)

  constructor(
    private readonly alchemyTransactionService: AlchemyTransactionService,
    private readonly userService: UsersService
  ) {
    super()
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`Processing job ${job.id} for Alchemy transaction sync`)

    const addresses = []
    const users = await this.userService.listAllUsers()
    for (const user of users) {
      if (user.privySmartWalletAddress) {
        addresses.push(user.privySmartWalletAddress)
      }
    }
    if (addresses.length === 0) {
      this.logger.warn('No virtual account addresses found for Alchemy sync')
      return
    }
    await this.alchemyTransactionService.syncTransactions(addresses)
    this.logger.log(`✅ Synced Alchemy transactions for ${addresses.length} addresses`)
  }
}
