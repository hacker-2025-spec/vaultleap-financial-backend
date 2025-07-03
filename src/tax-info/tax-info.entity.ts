import { v4 as uuid } from 'uuid'

import { attribute, hashKey, table } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

import { TaxFormType } from './tax-info.types'
import { TaxInfo1099FormDto, TaxInfoW8BenEFormDto, TaxInfoW8BenFormDto, TaxInfoW9FormDto } from './tax-info.dto'

@table(TablesNames.TAX_INFORMATION)
export class TaxInfoEntity {
  @hashKey({ defaultProvider: () => uuid() })
  id: string

  @attribute()
  auth0Id: string

  @attribute({
    indexKeyConfigurations: {
      vaultIdIndex: 'HASH',
    },
  })
  vaultId: string

  @attribute()
  email: string

  @attribute()
  formType?: TaxFormType

  @attribute()
  shareHolderRoleAddress?: string

  @attribute()
  t1099FormDetails?: TaxInfo1099FormDto

  @attribute()
  w9FormDetails?: TaxInfoW9FormDto

  @attribute()
  w8BenFormDetails?: TaxInfoW8BenFormDto

  @attribute()
  w8BenEFormDetails?: TaxInfoW8BenEFormDto

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string
}
