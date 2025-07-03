import { Logger } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { DataMapper } from '@nova-odm/mapper'

import { createApp } from '../createApp'
import { CustomerEntity } from '../customers/customers.entity'

async function run() {
  const app = await createApp({ logger: ['error'], bodyParser: false })
  const dataMapper = app.get(DataMapper)
  const logger = new Logger('AddCustomerIdScript')

  const iterator = dataMapper.scan(CustomerEntity)
  let updated = 0

  for await (const customer of iterator) {
    if (!customer.id) {
      customer.id = uuid()
      await dataMapper.update(customer)
      logger.log(`Updated customer ${customer.auth0Id} with id ${customer.id}`)
      updated++
    }
  }

  logger.log(`✅ Completed. Total customers updated: ${updated}`)
  await app.close()
}

run().catch((error) => {
  console.error('❌ Error running add-customer-id script:', error)
  process.exit(1)
})
