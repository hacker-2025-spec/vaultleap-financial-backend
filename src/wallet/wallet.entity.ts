import { table, hashKey, rangeKey, attribute } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

import { WALLET_TYPE } from './wallet.type'

@table(TablesNames.WALLETS)
export class WalletEntity {
  @hashKey()
  auth0Id: string

  @rangeKey()
  address: string

  @attribute({ defaultProvider: () => Date.now() })
  createdAt: string

  @attribute()
  walletType: WALLET_TYPE
}
