import type { AlchemyTransactionService } from '../../alchemy/services/alchemy-transaction.service'

type AlchemyServiceMock = Record<keyof AlchemyTransactionService, jest.Mock>

export const AlchemyServiceMock = {
  addUserAuthIdsToTransactions: jest.fn(),
  syncTransactions: jest.fn(),
} satisfies Partial<AlchemyServiceMock>
