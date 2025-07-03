import { table, hashKey, attribute } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.NOTES)
export class NoteEntity {
  @hashKey()
  transactionHash: string

  @attribute()
  userId: string

  @attribute()
  vaultId: string

  @attribute()
  note?: string

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string
}
