import supertest from 'supertest'
import { ConfigModule } from '@nestjs/config'
import { DataMapper } from '@nova-odm/mapper'
import { type INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { v4 as uuid } from 'uuid'

import { MockBaseUserGuard } from '../test/mocks'
import { clearDatabase } from '../test/clearDatabase'
import { BaseUserGuard } from '../auth/baseUser.guard'
import type { UsersEntity } from '../users/users.entity'
import { getFactory, type Factory } from '../test/factories'
import { NotesModule } from './notes.module'
import type { CreateFundingNoteDTO } from './notes.dto'
import { GlobalModule } from '../global.module'
import config from '../config/config'
import { GuardModule } from '../auth/guard.module'
import { setupDatabase } from '../test/setupDatabase'
import { getAllRecordsAsArray } from '../utils/dynamoDbHelpers'
import { NoteEntity } from './notes.entity'
import { setMiddlewares } from '../utils/setMiddlewares'
import { EthRpcService } from '../eth-rpc/eth-rpc.service'
import { EthRpcServiceMock } from '../test/mocks/EthRpcServiceMock'
import { ContractsResolverServiceMock } from '../test/mocks/ContractsResolverServiceMock'
import type { TransactionReceipt } from 'ethers'
import { NotesService } from './notes.service'
import { ContractsResolverService } from '../contractsResolver/contractsResolver.service'
import { EmailSenderService } from '../email-sender/email-sender.service'
import { EmailSenderServiceMock } from '../test/mocks/EmailSenderServiceMock'

describe('NotesController tests', () => {
  let app: INestApplication
  let factory: Factory
  let dataMapper: DataMapper
  let service: NotesService

  const vaultId = uuid()
  const amount = '200000000'
  const etherscanUrl = 'https://sepolia.basescan.org'

  const date = '2024-12-30'

  const ownderDashboardLink = `${process.env.REDIRECT_URL}/dashboard/vaults/`
  const rolesDashboardLink = `${process.env.REDIRECT_URL}/dashboard/vaults/?claim=true`

  const mockAuth0Id = MockBaseUserGuard.getLoggedUserData().auth0Id

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              ...config(),
              ETHERSCAN_URL: etherscanUrl,
            }),
          ],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        GlobalModule,
        GuardModule,
        NotesModule,
      ],
    })
      .overrideGuard(BaseUserGuard)
      .useClass(MockBaseUserGuard)
      .overrideProvider(EthRpcService)
      .useValue(EthRpcServiceMock)
      .overrideProvider(ContractsResolverService)
      .useValue(ContractsResolverServiceMock)
      .overrideProvider(EmailSenderService)
      .useValue(EmailSenderServiceMock)
      .compile()

    app = module.createNestApplication()
    setMiddlewares(app)
    await app.init()

    dataMapper = module.get<DataMapper>(DataMapper)
    factory = getFactory(dataMapper)
    service = module.get<NotesService>(NotesService)

    jest.spyOn(service, 'getDistributionName').mockResolvedValue(`my zvz 662 ja0 Vaul angta3 ${vaultId}`)
    jest.spyOn(service, 'getDate').mockReturnValue(new Date(date))

    EthRpcServiceMock.getTransactionReceipt.mockResolvedValue({} satisfies Partial<TransactionReceipt>)
    ContractsResolverServiceMock.getDataFromFundsDistributedEvent.mockReturnValue({ amount, address: '0x123' })
  })

  beforeEach(async () => {
    await setupDatabase(dataMapper)
  })

  afterEach(async () => {
    await clearDatabase(dataMapper)
    jest.clearAllMocks()
  })

  describe('POST /notes', () => {
    it('creates note for specific transaction and sends emails', async () => {
      // Set redirect URL to avoid undefined in links
      process.env.REDIRECT_URL = 'https://app.example.com'

      const vault = await factory.vault(mockAuth0Id)

      jest.spyOn(service, 'getDistributionName').mockResolvedValue(`my zvz 662 ja0 Vaul angta3 ${vault.id}`)

      const dto: CreateFundingNoteDTO = {
        transactionHash: '0x00001',
        vaultId: vault.id,
        note: 'memo note for transaction',
      }

      const { body } = await supertest(app.getHttpServer()).post('/notes').send(dto).expect(201)

      expect(body).toMatchObject({
        note: dto.note,
        transactionHash: dto.transactionHash,
        userId: mockAuth0Id,
      })

      const createdNotes = await getAllRecordsAsArray(dataMapper, NoteEntity)
      expect(createdNotes).toHaveLength(1)
      expect(createdNotes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            transactionHash: dto.transactionHash,
            userId: mockAuth0Id,
            vaultId: vault.id,
            note: dto.note,
            createdAt: expect.any(String),
          }),
        ])
      )

      expect(EthRpcServiceMock.getTransactionReceipt).toHaveBeenCalledWith(dto.transactionHash)

      const expectedOwnerEmailData = {
        amount: '200.0',
        date: '12/30/2024',
        email: vault.ownerEmail,
        fullName: vault.ownerName,
        memo: dto.note,
        transactionId: dto.transactionHash,
        transactionLink: `https://sepolia.basescan.org/tx/${dto.transactionHash}`,
        vaultName: vault.projectName,
        link: 'https://app.example.com/dashboard/vaults/',
      }

      const expectedRoleEmailData = {
        amount: service.calculateReceivedAmount('200000000', vault.vaultFeePercentage, vault.roles[0].sharePercentage),
        date: '12/30/2024',
        email: vault.roles[0].emails[0],
        fullName: vault.roles[0].name,
        memo: dto.note,
        transactionId: dto.transactionHash,
        transactionLink: `https://sepolia.basescan.org/tx/${dto.transactionHash}`,
        vaultName: vault.projectName,
        link: 'https://app.example.com/dashboard/vaults/?claim=true',
      }

      expect(EmailSenderServiceMock.sendFundsSent).toHaveBeenNthCalledWith(1, expectedOwnerEmailData)
      expect(EmailSenderServiceMock.sendFundsSent).toHaveBeenNthCalledWith(2, expectedRoleEmailData)
    })

    it('should work if note is missing in dto', async () => {
      process.env.REDIRECT_URL = 'https://app.example.com'

      const vault = await factory.vault(mockAuth0Id)

      jest.spyOn(service, 'getDistributionName').mockResolvedValue(`my zvz 662 ja0 Vaul angta3 ${vault.id}`)

      const dto: CreateFundingNoteDTO = {
        transactionHash: '0x00001',
        vaultId: vault.id,
      }

      const { body } = await supertest(app.getHttpServer()).post('/notes').send(dto).expect(201)

      expect(body).toMatchObject({
        transactionHash: dto.transactionHash,
        userId: mockAuth0Id,
      })

      const createdNotes = await getAllRecordsAsArray(dataMapper, NoteEntity)
      expect(createdNotes).toHaveLength(1)
      expect(createdNotes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            transactionHash: dto.transactionHash,
            userId: mockAuth0Id,
            vaultId: vault.id,
            createdAt: expect.any(String),
          }),
        ])
      )

      expect(EthRpcServiceMock.getTransactionReceipt).toHaveBeenCalledWith(dto.transactionHash)

      const expectedOwnerEmailData = {
        amount: '200.0',
        date: '12/30/2024',
        email: vault.ownerEmail,
        fullName: vault.ownerName,
        transactionId: dto.transactionHash,
        transactionLink: `https://sepolia.basescan.org/tx/${dto.transactionHash}`,
        vaultName: vault.projectName,
        link: 'https://app.example.com/dashboard/vaults/',
        memo: undefined,
      }

      const expectedRoleEmailData = {
        amount: service.calculateReceivedAmount('200000000', vault.vaultFeePercentage, vault.roles[0].sharePercentage),
        date: '12/30/2024',
        email: vault.roles[0].emails[0],
        fullName: vault.roles[0].name,
        transactionId: dto.transactionHash,
        transactionLink: `https://sepolia.basescan.org/tx/${dto.transactionHash}`,
        vaultName: vault.projectName,
        link: 'https://app.example.com/dashboard/vaults/?claim=true',
        memo: undefined,
      }

      expect(EmailSenderServiceMock.sendFundsSent).toHaveBeenNthCalledWith(1, expectedOwnerEmailData)
      expect(EmailSenderServiceMock.sendFundsSent).toHaveBeenNthCalledWith(2, expectedRoleEmailData)
    })

    it('should create only one note', async () => {
      const note = await factory.note()

      const dto: CreateFundingNoteDTO = {
        transactionHash: note.transactionHash,
        vaultId: uuid(),
        note: 'memo note for trasaction',
      }

      const { body } = await supertest(app.getHttpServer()).post('/notes').send(dto).expect(400)

      expect(body).toEqual({ error: 'Bad Request', message: 'Note already exists', statusCode: 400 })

      const createdNotes = await getAllRecordsAsArray(dataMapper, NoteEntity)
      expect(createdNotes).toHaveLength(1)
      expect(createdNotes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            transactionHash: note.transactionHash,
          }),
        ])
      )
    })

    it('fails if vault not found', async () => {
      const dto: CreateFundingNoteDTO = {
        transactionHash: '0x00001',
        vaultId: uuid(),
        note: 'memo note for trasaction',
      }

      const { body } = await supertest(app.getHttpServer()).post('/notes').send(dto).expect(400)

      expect(body).toEqual({ error: 'Bad Request', message: 'Vault not found', statusCode: 400 })

      const createdNotes = await getAllRecordsAsArray(dataMapper, NoteEntity)
      expect(createdNotes).toHaveLength(0)
    })

    it('fails if vault ID in the transaction does not match the original vault ID', async () => {
      const vault = await factory.vault()

      const dto: CreateFundingNoteDTO = {
        transactionHash: '0x00001',
        vaultId: vault.id,
        note: 'memo note for trasaction',
      }

      const { body } = await supertest(app.getHttpServer()).post('/notes').send(dto).expect(400)

      expect(body).toEqual({ error: 'Bad Request', message: 'Vault IDs do not match', statusCode: 400 })

      const createdNotes = await getAllRecordsAsArray(dataMapper, NoteEntity)
      expect(createdNotes).toHaveLength(0)

      expect(EthRpcServiceMock.getTransactionReceipt).toHaveBeenCalledWith(dto.transactionHash)
    })

    it('fails if any field is missing in DTO (class validator test)', async () => {
      const dto = {
        transactionHash: '0x00001',
        note: 'memo note for trasaction',
      }

      const { body } = await supertest(app.getHttpServer()).post('/notes').send(dto).expect(400)

      expect(body).toEqual({ error: 'Bad Request', message: ['vaultId should not be empty', 'vaultId must be a string'], statusCode: 400 })
    })
  })
})
