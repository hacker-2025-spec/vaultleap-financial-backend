import type { DataMapper } from '@nova-odm/mapper'

import { deleteLocalTable, tableEntities } from '../utils/dynamoDbHelpers'

export const clearDatabase = async (dataMapper: DataMapper) => {
  for (const tableName of Object.keys(tableEntities)) {
    // eslint-disable-next-line no-await-in-loop
    await deleteLocalTable(dataMapper, tableName as keyof typeof tableEntities)
  }
}
