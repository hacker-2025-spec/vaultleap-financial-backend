import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { DataMapper } from '@nova-odm/mapper'

import config from '../config/config'
import { GlobalModule } from '../global.module'
import { clearDatabase } from '../test/clearDatabase'
import { MockBaseUserGuard, MockS3ExternalStorage } from '../test/mocks'
import { TaxFormType } from '../tax-info/tax-info.types'
import { type Factory, getFactory } from '../test/factories'
import { S3ExternalStorage } from '../aws/S3ExternalStorage'
import type { AggregatedClaimsPerUserPerYearsType } from '../vault/vault.types'

import { TaxFormModule } from './tax-form.module'
import { TaxFormService } from './tax-form.service'
import { setupDatabase } from '../test/setupDatabase'

describe('TaxForm service', () => {
  let taxFormService: TaxFormService
  let dataMapper: DataMapper
  let factory: Factory

  const mockAuth0Id = MockBaseUserGuard.getLoggedUserData().auth0Id

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [config], isGlobal: true, ignoreEnvFile: true }), GlobalModule, TaxFormModule],
    })
      .overrideProvider(S3ExternalStorage)
      .useClass(MockS3ExternalStorage)
      .compile()

    taxFormService = moduleRef.get<TaxFormService>(TaxFormService)
    dataMapper = moduleRef.get<DataMapper>(DataMapper)
    factory = getFactory(dataMapper)
  })

  beforeEach(async () => {
    await setupDatabase(dataMapper)
  })

  afterEach(async () => {
    await clearDatabase(dataMapper)
  })

  it('generates 1099 tax forms for all the recipients and payer', async () => {
    const year = '2024'
    const userEmail = MockBaseUserGuard.getLoggedUserData().email || ''

    const payerRole1 = await factory.role()
    const payerRole2 = await factory.role()
    const payerRole3 = await factory.role()
    const payerRole4 = await factory.role()
    const payerRole5 = await factory.role()

    const roles = [payerRole1, payerRole2, payerRole3, payerRole4, payerRole5]
    const vault = await factory.vault(mockAuth0Id, roles)

    // Create taxInfo for each payer role
    await factory.taxInfo(mockAuth0Id, vault.id, payerRole1.shareHolderRoleAddress, userEmail)
    await factory.taxInfo(mockAuth0Id, vault.id, payerRole2.shareHolderRoleAddress, userEmail)
    await factory.taxInfo(mockAuth0Id, vault.id, payerRole3.shareHolderRoleAddress, userEmail)
    await factory.taxInfo(mockAuth0Id, vault.id, payerRole4.shareHolderRoleAddress, userEmail)
    await factory.taxInfo(mockAuth0Id, vault.id, payerRole5.shareHolderRoleAddress, userEmail)

    const payer = await factory.taxInfo(mockAuth0Id, vault.id, payerRole1.shareHolderRoleAddress, userEmail)

    jest.spyOn(taxFormService['taxInfoService'], 'getTaxInfoByVaultIdAndTokenAddress').mockResolvedValue({
      id: 'mock-id',
      auth0Id: payer.auth0Id,
      vaultId: vault.id,
      email: payer.email,
      formType: TaxFormType.FORM_1099,
      t1099FormDetails: {
        businessName: 'Test Business Inc.',
        address: '123 Main St',
        city: 'Testville',
        state: 'CA',
        zip: '90210',
        ssn: '123456789',
        country: 'USA',
      },
      w9FormDetails: payer.w9FormDetails,
    })

    const mockClaim = (address: string, id: string): AggregatedClaimsPerUserPerYearsType => ({
      amount: '1000000000',
      id,
      vaultAddress: address,
      year,
    })

    // Create claims for all 5 roles
    const claimMap = {
      [payerRole1.shareHolderRoleAddress!]: mockClaim(payerRole1.shareHolderRoleAddress!, 'claim1'),
      [payerRole2.shareHolderRoleAddress!]: mockClaim(payerRole2.shareHolderRoleAddress!, 'claim2'),
      [payerRole3.shareHolderRoleAddress!]: mockClaim(payerRole3.shareHolderRoleAddress!, 'claim3'),
      [payerRole4.shareHolderRoleAddress!]: mockClaim(payerRole4.shareHolderRoleAddress!, 'claim4'),
      [payerRole5.shareHolderRoleAddress!]: mockClaim(payerRole5.shareHolderRoleAddress!, 'claim5'),
    }

    jest
      .spyOn(taxFormService, 'getAggregatedClaimData')
      .mockImplementation(async ({ vaultAddress }) => (await claimMap[vaultAddress]) || null)

    await taxFormService.generateYearly1099TaxFormsForVault({ vaultId: vault.id, year })

    const allForms = await taxFormService.getAllUserForms(payer.auth0Id)

    const payerForms = allForms.filter((f) => f.userType === 'payer')
    const recipientForms = allForms.filter((f) => f.userType === 'recipient')

    expect(payerForms.length).toEqual(5)
    expect(recipientForms.length).toEqual(5)

    expect([...payerForms, ...recipientForms].every((f) => f.formType === TaxFormType.FORM_1099)).toBe(true)
    expect([...payerForms, ...recipientForms].every((f) => f.vaultId === vault.id)).toBe(true)
    expect([...payerForms, ...recipientForms].every((f) => f.taxYear === Number(year))).toBe(true)
  })

  it('does not generate 1099 tax forms for recipients with no claims', async () => {
    const role = await factory.role()
    const payerEmail = `payer-${Date.now()}@test.com`
    const vault = await factory.vault(mockAuth0Id, [role])
    const payer = await factory.taxInfo(mockAuth0Id, vault.id, undefined, payerEmail)
    const recipient = await factory.taxInfo(mockAuth0Id, vault.id, role.shareHolderRoleAddress)

    taxFormService.getAggregatedClaimData = jest.fn().mockResolvedValue(null)

    await taxFormService.generateYearly1099TaxFormsForVault({ vaultId: vault.id, year: '2024' })

    const payerForms = await taxFormService.getAllUserForms(payer.auth0Id)
    expect(payerForms.length).toEqual(0)

    const recipientForms = await taxFormService.getAllUserForms(recipient.auth0Id)
    expect(recipientForms.length).toEqual(0)
  })

  it('generates W9 form with recipient data', async () => {
    const role = await factory.role()
    const vault = await factory.vault(mockAuth0Id, [role])
    const recipient = await factory.taxInfo(mockAuth0Id, vault.id, role.shareHolderRoleAddress)

    await taxFormService.createW9TaxForm(vault.id, recipient.w9FormDetails!.fullName, recipient.shareHolderRoleAddress!)

    const recipientForms = await taxFormService.getAllUserForms(recipient.auth0Id)
    expect(recipientForms.length).toEqual(1)

    const form = recipientForms[0]
    expect(form.formType).toEqual(TaxFormType.FORM_W9)
    expect(form.vaultId).toEqual(vault.id)
    expect(form.taxYear).toEqual(new Date().getFullYear())
  })
})
