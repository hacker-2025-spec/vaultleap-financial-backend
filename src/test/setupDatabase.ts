import type { DataMapper } from '@nova-odm/mapper'

import { AuditEntity } from '../audit/audit.entity'
import { UsersEntity } from '../users/users.entity'
import { VaultEntity } from '../vault/vault.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { SumSubEntity } from '../sum-sub/sum-sub.entity'
import { TaxFormEntity } from '../tax-form/tax-form.entity'
import { TaxInfoEntity } from '../tax-info/tax-info.entity'
import { VaultsCreatorEntity } from '../vaults-creator/vaults-creator.entity'
import { ShareHoldersClaimAccountsEntity } from '../shareholders-claim-accounts/shareholders-claim-accounts.entity'
import { NoteEntity } from '../notes/notes.entity'
import { AddressActivityEntity } from '../address-activity/entities/address-activity.entity'

export const createLocalAuditTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(AuditEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
    indexOptions: {
      taxFormIdIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    },
  })
}

export const createLocalUsersTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(UsersEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
  })
}

export const createLocalVaultTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(VaultEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
    indexOptions: {
      userIdIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    },
  })
}

export const createLocalVaultsCreatorTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(VaultsCreatorEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
  })
}

export const createLocalWalletTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(WalletEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
  })
}

export const createLocalShareholdersClaimAccountsTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(ShareHoldersClaimAccountsEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
    indexOptions: {
      userEmailIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
      vaultIdIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    },
  })
}

export const createLocalTaxFormTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(TaxFormEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
    indexOptions: {
      auth0IdIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
      vaultIdIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    },
  })
}

export const createLocalSumSubTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(SumSubEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
  })
}

export const createLocalTaxInfoTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(TaxInfoEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
    indexOptions: {
      vaultIdIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    },
  })
}

export const createLocalNotesTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(NoteEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
  })
}

export const createLocalAddressActivityTable = async (dataMapper: DataMapper) => {
  await dataMapper.ensureTableExists(AddressActivityEntity, {
    writeCapacityUnits: 5,
    readCapacityUnits: 5,
    indexOptions: {
      fromAddressIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
      toAddressIndex: {
        type: 'global',
        projection: 'all',
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    },
  })
}

export const setupDatabase = async (dataMapper: DataMapper): Promise<void> => {
  await createLocalAuditTable(dataMapper)
  await createLocalUsersTable(dataMapper)
  await createLocalVaultTable(dataMapper)
  await createLocalVaultsCreatorTable(dataMapper)
  await createLocalWalletTable(dataMapper)
  await createLocalShareholdersClaimAccountsTable(dataMapper)
  await createLocalTaxFormTable(dataMapper)
  await createLocalSumSubTable(dataMapper)
  await createLocalTaxInfoTable(dataMapper)
  await createLocalNotesTable(dataMapper)
  await createLocalAddressActivityTable(dataMapper)
}
