import { v4 as uuid } from 'uuid'

import { table, hashKey, attribute } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'
import { TRANSACTION_STATUS } from '../evm-transaction-sender/evm-transaction-sender.types'

import type { TShareRoleDto } from './vault.dto'

@table(TablesNames.VAULT)
export class VaultEntity {
  @hashKey({ defaultProvider: () => uuid() })
  id: string

  @attribute({
    indexKeyConfigurations: {
      userIdIndex: 'HASH',
    },
  })
  userId: string

  @attribute()
  projectName: string

  @attribute({ type: 'Collection' })
  roles: TShareRoleDto[]

  @attribute()
  profitSwitchName?: string

  @attribute({ defaultProvider: () => 0 })
  profitSwitchAmount?: number

  @attribute()
  profitSwitchAddress?: string

  @attribute()
  ownerName: string

  @attribute()
  ownerEmail: string

  @attribute()
  adminWalletAddress: string

  @attribute()
  vaultFeePercentage: number

  @attribute()
  vaultAddress?: string

  @attribute()
  shareholderManagerAddress: string

  @attribute()
  transactionHash?: string

  @attribute()
  transactionStatus?: TRANSACTION_STATUS

  @attribute()
  watching: boolean

  @attribute({ defaultProvider: () => false })
  taxFormEnabled?: boolean

  @attribute()
  agreeToTOSAndPP: boolean

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string

  @attribute()
  selfManaged?: boolean
}
