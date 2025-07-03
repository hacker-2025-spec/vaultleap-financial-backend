import type { Handler } from 'aws-lambda'

import { NestFactory } from '@nestjs/core'

import { VaultsCreatorService } from '../vaults-creator/vaults-creator.service'
import { VaultsCreatorHandlerModule } from '../vaults-creator/vaults-creator-handler.module'

import type { CreateSeparatedVaultInput } from './lambdas.types'

let vaultsCreatorService: VaultsCreatorService

async function initializeVaultsCreatorService(): Promise<VaultsCreatorService> {
  if (!vaultsCreatorService) {
    const vaultsCreatorLambdaModule = await NestFactory.createApplicationContext(VaultsCreatorHandlerModule, {
      abortOnError: true,
    })
    // eslint-disable-next-line require-atomic-updates
    vaultsCreatorService = vaultsCreatorLambdaModule.get(VaultsCreatorService)
  }
  return vaultsCreatorService
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler: Handler<CreateSeparatedVaultInput, any> = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  await initializeVaultsCreatorService()
  if (event.stepName === 'CreateVault') {
    return await vaultsCreatorService.createSeparatedVault(event.detail.id, event.iterator.index, event.taskToken)
  }
  if (event.stepName === 'ProcessCreationStatus') {
    return await vaultsCreatorService.processCreationTransactionStatus(event.detail.id, event.iterator.index)
  }
  throw new Error(`Unknown stepName ${event.stepName}`)
}
