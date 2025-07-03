import { JsonRpcProvider } from 'ethers'
import type { TransactionReceipt, TransactionResponse } from 'ethers'

import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class EthRpcService {
  constructor(@Inject(JsonRpcProvider) private rpcProvider: JsonRpcProvider) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getRpcProvider(): Promise<JsonRpcProvider> {
    return this.rpcProvider
  }

  public getTransactionReceipt(transactionHash: TransactionResponse['hash']): Promise<TransactionReceipt | null> {
    return this.rpcProvider.getTransactionReceipt(transactionHash)
  }
}
