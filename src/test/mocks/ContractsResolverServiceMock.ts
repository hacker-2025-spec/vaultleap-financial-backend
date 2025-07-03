import type { ContractsResolverService } from '../../contractsResolver/contractsResolver.service'

type ContractsResolverServiceMock = Record<keyof ContractsResolverService, jest.Mock>

export const ContractsResolverServiceMock = {
  getDataFromFundsDistributedEvent: jest.fn(),
} satisfies Partial<ContractsResolverServiceMock>
