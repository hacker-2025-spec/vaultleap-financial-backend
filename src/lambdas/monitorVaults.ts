import { NestFactory } from '@nestjs/core'
import type { Handler } from 'aws-lambda'

import { VaultMonitoringService } from '../vault-monitoring/vault-monitoring.service'
import { VaultMonitoringModule } from '../vault-monitoring/vault-monitoring.module'
import type { HandlerInput } from './lambdas.types'

let vaultMonitoringService: VaultMonitoringService

async function initializeVaultMonitoringService(): Promise<VaultMonitoringService> {
  if (!vaultMonitoringService) {
    const vaultMonitoringLambdaModule = await NestFactory.createApplicationContext(VaultMonitoringModule, {
      abortOnError: true,
    })
    // eslint-disable-next-line require-atomic-updates
    vaultMonitoringService = vaultMonitoringLambdaModule.get(VaultMonitoringService)
  }
  console.log('Service initialized')
  return vaultMonitoringService
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler: Handler<HandlerInput, any> = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handler = await initializeVaultMonitoringService()
  return await handler[event.State.Name](event.Event)
}
