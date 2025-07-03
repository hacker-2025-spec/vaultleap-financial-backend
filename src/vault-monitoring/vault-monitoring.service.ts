import { Injectable } from '@nestjs/common'
import { ShareHolderVault__factory, ShareRolesManager__factory } from '@KLYDO-io/getrewards-contracts'

import type { VaultDto } from '../vault/vault.dto'
import { VaultService } from '../vault/vault.service'
import { EthRpcService } from '../eth-rpc/eth-rpc.service'
import type { MonitorVaultInput } from '../lambdas/lambdas.types'
import { EmailSenderService } from '../email-sender/email-sender.service'

@Injectable()
export class VaultMonitoringService {
  constructor(
    protected vaultService: VaultService,
    protected ethRpcService: EthRpcService,
    private emailSenderService: EmailSenderService
  ) {}

  async checkIfVaultWasClaimedAfter18Months(event: MonitorVaultInput['Event']) {
    let vault: VaultDto
    try {
      vault = await this.vaultService.getVaultById(event.detail.vaultId)
    } catch {
      return
    }
    const provider = await this.ethRpcService.getRpcProvider()
    for (const [index, role] of vault.roles.entries()) {
      const contract = new ShareHolderVault__factory().connect(provider)
      // eslint-disable-next-line no-await-in-loop
      const isClaimed = await contract.attach(role.shareHolderRoleAddress).getFunction('alreadyClaimed').staticCall()

      if (!isClaimed) {
        // eslint-disable-next-line no-await-in-loop
        const unclaimedAmount = await new ShareRolesManager__factory()
          .connect(provider)
          .attach(vault.shareholderManagerAddress)
          .getFunction('claim')
          .staticCall(role.shareHolderRoleAddress, index.toString())
          .then((value) => (Number(value.toString()) / 1_000_000).toFixed(2))
          .catch(() => '0.00')

        // eslint-disable-next-line no-await-in-loop
        await this.emailSenderService.sendAdminReclaimVaultKeysEmail(
          vault.ownerName,
          vault.projectName,
          vault.ownerEmail,
          vault.adminWalletAddress,
          role.name,
          unclaimedAmount,
          vault.id,
          index.toString(),
          role.shareHolderRoleAddress
        )
      }
    }
  }
}
