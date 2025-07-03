import type { EthRpcService } from '../../eth-rpc/eth-rpc.service'

type EthRpcServiceMock = Record<keyof EthRpcService, jest.Mock>

export const EthRpcServiceMock = {
  getRpcProvider: jest.fn(),
  getTransactionReceipt: jest.fn(),
} satisfies EthRpcServiceMock
