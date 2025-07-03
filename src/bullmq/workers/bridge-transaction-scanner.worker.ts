import { WorkerHost, Processor } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { BRIDEGE_TRANSACTION_SCANNER_QUEUE } from '../constants'
import { BridgeXyzSyncService } from '../../bridge-xyz/services/bridge-xyz.sync.service'

@Processor(BRIDEGE_TRANSACTION_SCANNER_QUEUE)
export class BridgeTransactionScannerWorker extends WorkerHost {
  private readonly logger = new Logger(BridgeTransactionScannerWorker.name)

  constructor(private readonly bridgeXyzSyncService: BridgeXyzSyncService) {
    super()
  }

  async process(job: Job, token?: string): Promise<void> {
    const result = await this.bridgeXyzSyncService.syncCustomerActivities()

    // Only log if there were actual changes
    if (result.activitiesProcessed > 0) {
      this.logger.log(`Bridge scanner processed ${result.activitiesProcessed} activities in job ${job.id}`)
    }
  }
}
