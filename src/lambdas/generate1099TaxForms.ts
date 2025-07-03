import { SQS, type AWSError } from 'aws-sdk'
import type { Handler, SQSEvent } from 'aws-lambda'

import { NestFactory } from '@nestjs/core'

import { TaxFormService } from '../tax-form/tax-form.service'
import { TaxFormHandlerModule } from '../tax-form/tax-form-handler.module'

let taxFormService: TaxFormService

async function initializeTaxFormService(): Promise<TaxFormService> {
  if (!taxFormService) {
    const taxFormsLambdaModule = await NestFactory.createApplicationContext(TaxFormHandlerModule, {
      abortOnError: true,
    })
    // eslint-disable-next-line require-atomic-updates
    taxFormService = taxFormsLambdaModule.get(TaxFormService)
  }
  console.log('Tax form service initialized')
  return taxFormService
}

export const schedule1099ForAllVaults = async () => {
  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1
  console.log(`Generating 1099 tax forms for year ${previousYear}`)
  await initializeTaxFormService()
  const SQShandler = new SQS()
  const taxFormsQueueUrl = process.env.TAX_FORMS_QUEUE_URL || ''
  const messageGroupId = 'tax-forms-1099'

  const allVaults = await taxFormService.getAllVaultsWithTaxFormsEnabled()
  const messagesToSend = []
  for (const vault of allVaults) {
    const vaultId = vault.id
    const params: SQS.Types.SendMessageRequest = {
      QueueUrl: taxFormsQueueUrl,
      MessageBody: JSON.stringify({ vaultId, year: previousYear }),
      MessageGroupId: messageGroupId,
    }
    const messagePromise = SQShandler.sendMessage(params, (error: AWSError, data: SQS.Types.SendMessageResult) => {
      if (error) {
        console.error(`Error sending message to queue for vault ${vaultId}. Details:`, error)
        return
      }
      if (data) {
        console.log(`Message successfully sent to queue for vault ${vaultId}`)
      }
    }).promise()
    messagesToSend.push(messagePromise)
  }

  await Promise.allSettled(messagesToSend)
  console.log(`Finished sending ${messagesToSend.length} messages to queue`)
}

export const generate1099TaxFormsForAVault: Handler<SQSEvent, void> = async (event, _context) => {
  const record = event.Records[0]
  const data: { vaultId: string; year: string } = JSON.parse(record.body)
  console.log(`Launching 1099 tax forms generation for year ${data.year}, vault ${data.vaultId}`)
  await initializeTaxFormService()
  await taxFormService.generateYearly1099TaxFormsForVault(data)
}
