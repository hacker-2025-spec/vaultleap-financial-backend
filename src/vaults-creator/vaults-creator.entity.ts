import { v4 as uuid } from 'uuid'

import { attribute, hashKey, table } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

import { TaxInfoVaultsConfigDto } from './vaults-creator.dto'
import { VaultsCreationStatus } from './vaults-creator.types'
import type { CreatorVaultDto } from './creator-vault.dto'

@table(TablesNames.VAULTS_CREATOR)
export class VaultsCreatorEntity {
  @hashKey({ defaultProvider: () => uuid() })
  id: string

  @attribute()
  auth0Id: string

  @attribute({ type: 'Collection' })
  vaults: CreatorVaultDto[]

  @attribute({ defaultProvider: () => false })
  taxFormEnabled?: boolean

  @attribute()
  ownerTaxInfo?: TaxInfoVaultsConfigDto

  @attribute()
  creationStatus: VaultsCreationStatus

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string
}
