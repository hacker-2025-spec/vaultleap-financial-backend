import { v4 as uuid } from 'uuid'

import { attribute, hashKey, table } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

import type { AuditAccessEventDto } from './audit.dto'

@table(TablesNames.AUDIT)
export class AuditEntity {
  @hashKey({ defaultProvider: () => uuid() })
  id: string

  @attribute({
    indexKeyConfigurations: {
      taxFormIdIndex: 'HASH',
    },
  })
  taxFormId: string

  @attribute()
  auth0Id: string

  @attribute({ type: 'Collection' })
  accessEvents: AuditAccessEventDto[]
}
