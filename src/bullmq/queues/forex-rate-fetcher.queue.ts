import type { OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { FOREX_RATE_FETCHER_QUEUE } from '../constants'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class ForexRateFetcherQueue implements OnModuleInit {
  private readonly logger = new Logger(ForexRateFetcherQueue.name)

  constructor(
    @InjectQueue(FOREX_RATE_FETCHER_QUEUE)
    private readonly queue: Queue
  ) {}

  async onModuleInit() {
    await this.addRecurringFetchJob()
  }

  private async addRecurringFetchJob(): Promise<void> {
    try {
      await this.safelyUpsertScheduler(
        this.queue,
        FOREX_RATE_FETCHER_QUEUE,
        { every: 900_000 },
        {
          name: FOREX_RATE_FETCHER_QUEUE,
          data: {},
        }
      )
      this.logger.debug(`⏱️ Scheduler "${FOREX_RATE_FETCHER_QUEUE}" upserted successfully`)
    } catch (error) {
      this.logger.error('❌ Failed to upsert recurring job scheduler', error.stack)
    }
  }

  private async safelyUpsertScheduler(
    queue: Queue,
    schedulerId: string,
    repeatOpts: { every?: number },
    jobTemplate: { name?: string; data?: any }
  ) {
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
