import { attribute, hashKey, table } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

import { ReviewStatus } from './sum-sub.types'

@table(TablesNames.SUM_SUB)
export class SumSubEntity {
  @hashKey({ type: 'String', keyType: 'HASH' })
  id: string

  @attribute()
  auth0Id: string

  @attribute()
  applicantStatus?: ReviewStatus

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string
}
