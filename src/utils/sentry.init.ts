import Sentry from '@sentry/nestjs'

import { nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1,
  profilesSampleRate: 1,
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === 'development',
  sendDefaultPii: false,
})
