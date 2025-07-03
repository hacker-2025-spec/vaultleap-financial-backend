import { table, hashKey, attribute } from '@nova-odm/annotations'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.USERS)
export class UsersEntity {
  @hashKey({ type: 'String', keyType: 'HASH', attributeName: 'auth0Id' })
  auth0Id: string

  @attribute()
  email: string

  @attribute()
  name: string

  @attribute({ defaultProvider: () => false })
  isPremium: boolean

  @attribute()
  avatar?: string

  @attribute()
  avatarS3Key?: string

  @attribute()
  entityName?: string

  @attribute()
  jurisdiction?: string

  @attribute()
  registrationId?: string

  @attribute()
  countryOfResidence?: string

  @attribute()
  privyWalletAddress?: string

  @attribute({
    indexKeyConfigurations: {
      privySmartWalletAddressIndex: 'HASH',
    },
  })
  privySmartWalletAddress?: string
}
