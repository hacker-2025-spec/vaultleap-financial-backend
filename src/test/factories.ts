import { faker } from '@faker-js/faker'
import type { DataMapper } from '@nova-odm/mapper'

import type { TShareRoleDto } from '../vault/vault.dto'
import { UsersEntity } from '../users/users.entity'
import { VaultEntity } from '../vault/vault.entity'
import { TaxFormEntity } from '../tax-form/tax-form.entity'
import { FedTaxClassification, TaxFormType } from '../tax-info/tax-info.types'
import { TaxInfoEntity } from '../tax-info/tax-info.entity'
import type { TaxInfo1099FormDto, TaxInfoW9FormDto } from '../tax-info/tax-info.dto'
import { TRANSACTION_STATUS } from '../evm-transaction-sender/evm-transaction-sender.types'
import { NoteEntity } from '../notes/notes.entity'

let sequence = 0
const next = () => ++sequence

export interface Factory {
  user: (email?: string) => Promise<UsersEntity>
  role: () => TShareRoleDto
  vault: (userId?: string, roles?: TShareRoleDto[]) => Promise<VaultEntity>
  taxForm: (auth0Id?: string) => Promise<TaxFormEntity>
  t1099FormDetails: () => TaxInfo1099FormDto
  w9FormDetails: () => TaxInfoW9FormDto
  taxInfo: (auth0Id?: string, vaultId?: string, shareHolderRoleAddress?: string, email?: string) => Promise<TaxInfoEntity>
  note: (userId?: string, vaultId?: string) => Promise<NoteEntity>
}

let factoryCached: Factory | undefined

export const getFactory = (dataMapper: DataMapper): Factory => {
  if (!factoryCached) {
    factoryCached = {
      user: async (email?: string): Promise<UsersEntity> => {
        const user = Object.assign(new UsersEntity(), {
          auth0Id: `auth0|123456${next()}`,
          email: email ? email : `user${sequence}@klydo.com`,
          name: faker.person.firstName(),
          isPremium: false,
        })
        return await dataMapper.put(user)
      },

      role: (): TShareRoleDto => ({
        name: `role-${next()}`,
        sharePercentage: 100,
        emails: [`recipient${sequence}@klydo.com`],
        count: 1,
        shareHolderRoleAddress: `0x7639${sequence}`,
        watching: true,
        totalIncome: '',
        taxInfoProvided: false,
      }),

      vault: async (userId?: string, roles?: TShareRoleDto[]): Promise<VaultEntity> => {
        const vault = Object.assign(new VaultEntity(), {
          userId: userId || `auth0|123456${next()}`,
          projectName: `project-${sequence}`,
          roles: roles || [factoryCached!.role()],
          ownerName: `Owner ${sequence}`,
          ownerEmail: `payer${sequence}@klydo.com`,
          vaultFeePercentage: 0,
          transactionStatus: TRANSACTION_STATUS.SUCCESSFUL,
          watching: true,
          agreeToTOSAndPP: true,
          createdAt: new Date(),
        })
        return await dataMapper.put(vault)
      },
      taxForm: async (auth0Id?: string): Promise<TaxFormEntity> => {
        const form = Object.assign(new TaxFormEntity(), {
          auth0Id: auth0Id || `auth0|456123${next()}`,
          s3Key: `tax-form-${sequence}.pdf`,
          shareHolderRoleAddress: `0x7639${sequence}`,
          formType: TaxFormType.FORM_W9,
          vaultId: `vault-id-${sequence}`,
          id: undefined,
          taxYear: new Date().getFullYear(),
          createdAt: new Date(),
        })
        return await dataMapper.put(form)
      },

      t1099FormDetails: (): TaxInfo1099FormDto => ({
        businessName: `Owner Legal ${sequence}`,
        address: '123 Fake St',
        city: faker.location.city(),
        state: faker.location.state(),
        country: 'USA',
        zip: `1234${sequence}`,
        ssn: '73456'.padEnd(9, sequence.toString()),
        ein: '73456'.padEnd(9, sequence.toString()),
      }),

      w9FormDetails: (): TaxInfoW9FormDto => ({
        fullName: `Full name ${sequence}`,
        businessName: `Owner Legal ${sequence}`,
        address: '123 Fake St',
        city: faker.location.city(),
        state: faker.location.state(),
        country: 'USA',
        zip: `1234${sequence}`,
        fedTaxClassification: FedTaxClassification.C_CORPORATION,
        readAndUnderstand: false,
        signature: faker.person.fullName(),
        date: new Date().toISOString(),
        consent: false,
      }),

      taxInfo: async (auth0Id?: string, vaultId?: string, shareHolderRoleAddress?: string, email?: string): Promise<TaxInfoEntity> => {
        const taxInfo = Object.assign(new TaxInfoEntity(), {
          auth0Id: auth0Id || `auth0|456123${next()}`,
          vaultId: vaultId || `vault-id-${sequence}`,
          shareHolderRoleAddress: shareHolderRoleAddress || `0x7639${sequence}`,
          email: email || `payer${sequence}@klydo.com`, // 👈 customizable
          t1099FormDetails: factoryCached!.t1099FormDetails(),
          w9FormDetails: factoryCached!.w9FormDetails(),
          id: undefined,
          createdAt: new Date(),
        })
        return await dataMapper.put(taxInfo)
      },
      note: async (userId?: string, vaultId?: string): Promise<NoteEntity> => {
        const note = Object.assign(new NoteEntity(), {
          transactionHash: `0x00${next()}`,
          userId: userId || `user-id-${sequence}`,
          vaultId: vaultId || `vault-id-${sequence}`,
          note: `note-${sequence}`,
          createdAt: new Date(),
        })
        return await dataMapper.put(note)
      },
    }
  }

  return factoryCached
}
