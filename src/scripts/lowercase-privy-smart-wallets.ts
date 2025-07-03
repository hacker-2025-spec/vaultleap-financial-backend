import { DataMapper } from '@nova-odm/mapper'
import { Logger } from '@nestjs/common'
import { createApp } from '../createApp'
import { UsersEntity } from '../users/users.entity'

async function run() {
  const app = await createApp({ logger: ['error'], bodyParser: false })
  const dataMapper = app.get(DataMapper)
  const logger = new Logger('LowercaseWalletScript')

  const iterator = dataMapper.scan(UsersEntity)
  let updated = 0

  for await (const user of iterator) {
    const original = user.privySmartWalletAddress
    const lowercased = original?.toLowerCase()

    if (original && original !== lowercased) {
      user.privySmartWalletAddress = lowercased
      await dataMapper.update(user)
      logger.log(`Updated user ${user.auth0Id}`)
      updated++
    }
  }

  logger.log(`✅ Completed. Total users updated: ${updated}`)
  await app.close()
}

run().catch((error) => {
  console.error('❌ Error running lowercase script:', error)
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
})
