import './utils/sentry.init'
import { createApp } from './createApp'

async function bootstrap() {
  const app = await createApp({ logger: ['verbose'], bodyParser: false })
  console.log('Listening 3001')
  
  await app.listen(3001, '0.0.0.0')
}
// eslint-disable-next-line unicorn/prefer-top-level-await, @typescript-eslint/no-floating-promises
bootstrap()
