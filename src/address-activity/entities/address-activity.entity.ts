import { attribute, hashKey, table } from '@nova-odm/annotations'
import { TablesNames } from '../../utils/tablesNames'
import { v4 as uuid } from 'uuid'

@table(TablesNames.ADDRESS_ACTIVITY)
export class AddressActivityEntity {
  public constructor(partial?: Partial<AddressActivityEntity>) {
    Object.assign(this, partial)
  }

  @hashKey({ defaultProvider: () => uuid() })
  id: string

  @attribute({
    indexKeyConfigurations: {
      fromAddressIndex: 'HASH',
    },
  })
  fromAddress: string

  @attribute({
    indexKeyConfigurations: {
      toAddressIndex: 'HASH',
    },
  })
  toAddress: string

  @attribute({ type: 'Date' })
  createdAt: string

  @attribute()
  hash: string

  @attribute()
  blockNum: string

  @attribute()
  asset: string

  @attribute()
  value: number

  @attribute()
  rawContract: {
    value: string
    address: string
    decimal: number
  }

  @attribute()
  log: Record<any, any>
}
