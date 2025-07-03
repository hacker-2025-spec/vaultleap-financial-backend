import type { OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { BRIDEGE_TRANSACTION_SCANNER_QUEUE } from '../constants'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class BridgeTransactionScannerQueue implements OnModuleInit {
  private readonly logger = new Logger(BridgeTransactionScannerQueue.name)

  constructor(
    @InjectQueue(BRIDEGE_TRANSACTION_SCANNER_QUEUE)
    private readonly queue: Queue
  ) {}

  async onModuleInit() {
    await this.addRecurringScanJob()
  }

  private async addRecurringScanJob(): Promise<void> {
    try {
      await this.safelyUpsertScheduler(
        this.queue,
        BRIDEGE_TRANSACTION_SCANNER_QUEUE,
        { every: 10_000 },
        {
          name: BRIDEGE_TRANSACTION_SCANNER_QUEUE,
          data: {},
        }
      )
      this.logger.debug(`⏱️ Scheduler "${BRIDEGE_TRANSACTION_SCANNER_QUEUE}" upserted successfully`)
    } catch (error) {
      this.logger.error('❌ Failed to upsert recurring job scheduler', error.stack)
    }
  }

  /**
   * Safely upserts a BullMQ repeatable job scheduler.
   * If an existing job with the same ID but different repeat options is found, it is removed first.
   *
   * @param queue - BullMQ Queue instance
   * @param schedulerId - Unique ID for the repeatable job
   * @param repeatOpts - Repeat options (e.g., { every: 5000 })
   * @param jobTemplate - Job template used when scheduling the job
   */
  private async safelyUpsertScheduler(
    queue: Queue,
    schedulerId: string,
    repeatOpts: { every?: number },
    jobTemplate: { name?: string; data?: any }
  ) {
    // More reliable method
    const existingJobs = await queue.getJobSchedulers()
    const existing = existingJobs.find((job) => job.name === schedulerId || job.id === schedulerId)
    const isRepeatChanged = repeatOpts.every !== undefined && Number(existing?.every) !== repeatOpts.every

    if (existing && isRepeatChanged) {
      await queue.removeJobScheduler(existing.key)
      this.logger.log(`🧹 Removed outdated scheduler "${schedulerId}" with key ${existing.key}`)
    }

    const nextJob = await queue.upsertJobScheduler(schedulerId, repeatOpts, jobTemplate)
    this.logger.log(`✅ Scheduler "${schedulerId}" upserted. Next run: ${new Date(nextJob.timestamp)}`)
  }
}
