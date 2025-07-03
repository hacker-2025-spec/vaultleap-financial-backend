import { v4 as uuid } from 'uuid'

import { attribute, hashKey, table } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.SHAREHOLDERS_CLAIM_ACCOUNTS)
export class ShareHoldersClaimAccountsEntity {
  @hashKey({ defaultProvider: () => uuid() })
  id: string

  @attribute({
    indexKeyConfigurations: {
      userEmailIndex: 'HASH',
    },
  })
  userEmail: string

  @attribute({
    indexKeyConfigurations: {
      vaultIdIndex: 'HASH',
    },
  })
  vaultId: string

  @attribute()
  tokenId: number

  @attribute()
  address: string

  @attribute()
  privateKey?: string

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string

  @attribute()
  iv?: Buffer

  @attribute()
  secretKey?: Buffer

  @attribute()
  authTag?: Buffer

  @attribute()
  encrypted?: string
}
