import type { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'

import { configure as awsServerlessExpress } from '@vendia/serverless-express'

import { createApp } from '../createApp'

let appServer: ReturnType<typeof awsServerlessExpress> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const startServer = async (event: APIGatewayProxyEvent, context: Context, callBack: Callback<any>) => {
  context.callbackWaitsForEmptyEventLoop = false

  if (!appServer) {
    const nestApp = await createApp({ bodyParser: false })

    await nestApp.init()
    const app = nestApp.getHttpAdapter().getInstance()

    // eslint-disable-next-line require-atomic-updates
    appServer = awsServerlessExpress({ app })
  }

  return appServer(event, context, callBack)
}
