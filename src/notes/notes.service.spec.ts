import { ConfigModule } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'

import { NotesModule } from './notes.module'
import { GlobalModule } from '../global.module'
import config from '../config/config'
import { GuardModule } from '../auth/guard.module'
import { ethers } from 'ethers'
import { NotesService } from './notes.service'

describe('NotesService tests', () => {
  let service: NotesService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              ...config(),
            }),
          ],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        GlobalModule,
        GuardModule,
        NotesModule,
      ],
    }).compile()

    service = module.get<NotesService>(NotesService)
  })

  describe('calculateReceivedAmount tests', () => {
    it('calculates shares amount', () => {
      const amount = ethers.parseUnits('220', 6).toString()

      const sharesAmount = service.calculateReceivedAmount(amount, 10, 100)

      expect(sharesAmount).toBe('200.00')
    })

    it('calculates shares amount if fee and shares are farctional numbers', () => {
      const amount = ethers.parseUnits('227.89', 6).toString()

      const sharesAmount = service.calculateReceivedAmount(amount, 9.01, 3.5)

      expect(sharesAmount).toBe('7.32')
    })
  })
})
