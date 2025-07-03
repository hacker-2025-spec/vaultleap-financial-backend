import { Inject, Injectable } from '@nestjs/common'
import { Deployments } from '@KLYDO-io/getrewards-contracts'

@Injectable()
export class PaymasterService {
  constructor(@Inject('Deployments') private deployments: Deployments) {}

  getPaymasterStubData() {
    return {
      sponsor: {
        name: 'Klydo Vaultleap',
      },
      paymasterAndData: this.deployments.WhitelistPaymaster_Proxy,
    }
  }

  getPaymasterData() {
    return {
      paymasterAndData: this.deployments.WhitelistPaymaster_Proxy,
    }
  }
}
