import { v4 as uuid } from 'uuid'

import { table, hashKey, attribute } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'
import { TaxFormType } from '../tax-info/tax-info.types'

import { TaxUserType } from './tax-form.generator'

@table(TablesNames.TAX_FORM)
export class TaxFormEntity {
  @hashKey({ defaultProvider: () => uuid() })
  id: string

  @attribute({
    indexKeyConfigurations: {
      auth0IdIndex: 'HASH',
    },
  })
  auth0Id: string

  @attribute({
    indexKeyConfigurations: {
      vaultIdIndex: 'HASH',
    },
  })
  vaultId: string

  @attribute()
  s3Key: string

  @attribute()
  shareHolderRoleAddress: string

  @attribute()
  formType: TaxFormType

  @attribute()
  userType?: TaxUserType

  @attribute()
  taxYear: number

  @attribute()
  securityCode?: string

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string
}
