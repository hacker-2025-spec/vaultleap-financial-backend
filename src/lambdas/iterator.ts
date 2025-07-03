/* eslint-disable prefer-destructuring */
import type { Handler } from 'aws-lambda'

import type { IteratorInput } from './lambdas.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, id-denylist
export const handler: Handler<IteratorInput, any> = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const collection = event.detail.collection || []
  const currentIndex = event.iterator ? event.iterator.index : -1
  const count = collection.length

  const index = currentIndex + 1

  callback(null, {
    index,
    count,
    continue: index < count,
  })
}
