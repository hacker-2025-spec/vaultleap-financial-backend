import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import { FOREX_RATE_FETCHER_QUEUE } from '../constants'
import { ForexService } from '../../forex/forex.service'

@Processor(FOREX_RATE_FETCHER_QUEUE)
export class ForexRateFetcherWorker extends WorkerHost {
  private readonly logger = new Logger(ForexRateFetcherWorker.name)

  constructor(private readonly forexService: ForexService) {
    super()
  }

  async process(job: Job, token?: string): Promise<void> {
    try {
      await this.forexService.fetchAndStoreForexRates()
      this.logger.log(`Forex rates fetched successfully in job ${job.id}`)
    } catch (error) {
      this.logger.error(`Failed to fetch forex rates in job ${job.id}`, error.stack)
      throw error
    }
  }
}
