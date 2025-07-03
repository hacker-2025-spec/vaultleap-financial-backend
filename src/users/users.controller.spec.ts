import supertest from 'supertest'
import { ConfigModule } from '@nestjs/config'
import { DataMapper } from '@nova-odm/mapper'
import { type INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'

import { MockBaseUserGuard, MockS3ExternalStorage } from '../test/mocks'
import { clearDatabase } from '../test/clearDatabase'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { getFactory, type Factory } from '../test/factories'
import { GlobalModule } from '../global.module'
import config from '../config/config'
import { GuardModule } from '../auth/guard.module'
import { setupDatabase } from '../test/setupDatabase'
import { setMiddlewares } from '../utils/setMiddlewares'
import { UsersModule } from './users.module'
import { S3ExternalStorage } from '../aws/S3ExternalStorage'
import { CustomersService } from '../customers/customers.service'
import { BridgeKYCService } from '../bridge-kyc/bridge-kyc.service'

describe('UsersController file upload tests', () => {
  let app: INestApplication
  let factory: Factory
  let dataMapper: DataMapper

  const mockAuth0Id = MockBaseUserGuard.getLoggedUserData().auth0Id

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [config],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        GlobalModule,
        GuardModule,
        UsersModule,
      ],
    })
      .overrideGuard(BaseUserGuard)
      .useClass(MockBaseUserGuard)
      .overrideProvider(S3ExternalStorage)
      .useValue(MockS3ExternalStorage)
      .overrideProvider(CustomersService)
      .useValue({
        getCustomerByAuth0Id: jest.fn().mockResolvedValue(null),
      })
      .overrideProvider(BridgeKYCService)
      .useValue({
        getBridgeKYC: jest.fn().mockResolvedValue(null),
      })
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
    jest.clearAllMocks()
  })

  describe('POST /users/me/upload-avatar-file', () => {
    it('should upload avatar file successfully', async () => {
      const user = await factory.user(mockAuth0Id)
      
      // Create a mock image buffer
      const imageBuffer = Buffer.from('fake-image-data')
      
      const response = await supertest(app.getHttpServer())
        .post('/users/me/upload-avatar-file')
        .attach('avatar', imageBuffer, 'test-avatar.jpg')
        .expect(201)

      expect(response.body).toMatchObject({
        auth0Id: mockAuth0Id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
      })
      
      expect(response.body.avatar).toBeDefined()
      expect(response.body.avatarS3Key).toBeDefined()
    })

    it('should fail when no file is provided', async () => {
      await factory.user(mockAuth0Id)
      
      const response = await supertest(app.getHttpServer())
        .post('/users/me/upload-avatar-file')
        .expect(400)

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: 'Avatar file is required',
        statusCode: 400,
      })
    })

    it('should fail when file is too large', async () => {
      await factory.user(mockAuth0Id)
      
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a')
      
      const response = await supertest(app.getHttpServer())
        .post('/users/me/upload-avatar-file')
        .attach('avatar', largeBuffer, 'large-avatar.jpg')
        .expect(400)

      expect(response.body.message).toContain('File too large')
    })

    it('should fail when file is not an image', async () => {
      await factory.user(mockAuth0Id)
      
      const textBuffer = Buffer.from('This is not an image')
      
      const response = await supertest(app.getHttpServer())
        .post('/users/me/upload-avatar-file')
        .attach('avatar', textBuffer, 'not-an-image.txt')
        .expect(400)

      expect(response.body.message).toContain('Only image files are allowed')
    })
  })
})
