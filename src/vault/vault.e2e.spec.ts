import supertest from 'supertest'
import { DataMapper } from '@nova-odm/mapper'
import { type INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'

import { MockBaseUserGuard } from '../test/mocks'
import { clearDatabase } from '../test/clearDatabase'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { getFactory, type Factory } from '../test/factories'
import config from '../config/config'
import { VaultModule } from './vault.module'
import { GuardModule } from '../auth/guard.module'
import { GlobalModule } from '../global.module'
import { setMiddlewares } from '../utils/setMiddlewares'
import { EmailSenderModule } from '../email-sender/email-sender.module'
import { AlchemyTransactionService } from '../alchemy/services/alchemy-transaction.service'
import { AlchemyServiceMock } from '../test/mocks/AlchemyServiceMock'
import { AddressActivityService } from '../address-activity/address-activity.service'
import { AddressActivityServiceMock } from '../test/mocks/AddressActivityServiceMock'
import { setupDatabase } from '../test/setupDatabase'

describe('Vault API with authenticated user', () => {
  let app: INestApplication
  let factory: Factory
  let dataMapper: DataMapper

  const mockAuth0Id = MockBaseUserGuard.getLoggedUserData().auth0Id

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [config], isGlobal: true, ignoreEnvFile: true }),
        GlobalModule,
        EmailSenderModule,
        GuardModule,
        VaultModule,
      ],
    })
      .overrideGuard(BaseUserGuard)
      .useClass(MockBaseUserGuard)
      .overrideProvider(AlchemyTransactionService)
      .useValue(AlchemyServiceMock)
      .overrideProvider(AddressActivityService)
      .useValue(AddressActivityServiceMock)
      .compile()

    app = module.createNestApplication()
    setMiddlewares(app)
    await app.init()

    dataMapper = module.get<DataMapper>(DataMapper)
    factory = getFactory(dataMapper)
  })

  beforeEach(async () => {
    await setupDatabase(dataMapper)
  })

  afterEach(async () => {
    await clearDatabase(dataMapper)
  })

  it('get all vaults', async () => {
    const vaultManager = await factory.vault(mockAuth0Id)
    const vaultContractor = await factory.vault(mockAuth0Id)

    const response = await supertest(app.getHttpServer()).get('/vault/vaults').expect(200)

    expect(Array.isArray(response.body)).toEqual(true)
    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: vaultManager.id }), expect.objectContaining({ id: vaultContractor.id })])
    )
  })

  it('get all vaults as manager', async () => {
    const vaultManager = await factory.vault(mockAuth0Id)
    await factory.vault(mockAuth0Id)
    await factory.vault(mockAuth0Id)

    const response = await supertest(app.getHttpServer()).get('/vault/vaults').query({ role: 'manager' }).expect(200)

    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: vaultManager.id })]))
  })

  it('get all vaults as contractor', async () => {
    await factory.vault(mockAuth0Id)
    await factory.vault(mockAuth0Id)

    const userEmail = MockBaseUserGuard.getLoggedUserData().email || ''
    const mockUser = await factory.user(userEmail)
    mockUser.email = userEmail
    mockUser.auth0Id = mockAuth0Id || ''
    await dataMapper.put(mockUser)

    const contractorRole = {
      ...factory.role(),
      name: 'contractor',
      emails: [userEmail],
    }

    const vaultContractor = await factory.vault(mockAuth0Id, [contractorRole])
    const response = await supertest(app.getHttpServer()).get('/vault/vaults').query({ role: 'contractor' }).expect(200)

    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: vaultContractor.id })]))
  })
})
