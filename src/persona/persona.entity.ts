import { attribute, hashKey, table } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'
import { PersonaReviewStatus } from './persona.types'

@table(TablesNames.PERSONA)
export class PersonaEntity {
  @hashKey({ type: 'String', keyType: 'HASH' })
  id: string

  @attribute()
  auth0Id: string

  @attribute()
  applicantStatus: PersonaReviewStatus

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string
}
