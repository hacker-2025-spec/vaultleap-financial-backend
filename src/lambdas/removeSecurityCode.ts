import type { Handler } from 'aws-lambda'

import { NestFactory } from '@nestjs/core'

import { TaxFormService } from '../tax-form/tax-form.service'
import { TaxFormHandlerModule } from '../tax-form/tax-form-handler.module'

import type { RemoveSecurityCodeInput } from './lambdas.types'

let taxFormService: TaxFormService

async function initializeTaxFormService(): Promise<TaxFormService> {
  if (!taxFormService) {
    const taxFormsLambdaModule = await NestFactory.createApplicationContext(TaxFormHandlerModule, {
      abortOnError: true,
    })
    // eslint-disable-next-line require-atomic-updates
    taxFormService = taxFormsLambdaModule.get(TaxFormService)
  }
  return taxFormService
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler: Handler<RemoveSecurityCodeInput, any> = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handler = await initializeTaxFormService()
  return await handler[event.State.Name](event.Event)
}
