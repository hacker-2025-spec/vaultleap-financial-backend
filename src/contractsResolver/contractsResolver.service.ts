import { ethers, type TransactionReceipt } from 'ethers'

import { Injectable } from '@nestjs/common'
import {
  ShareRolesManager__factory,
  DistributionStructureFactory__factory,
  FundsDistributor__factory,
} from '@KLYDO-io/getrewards-contracts'

@Injectable()
export class ContractsResolverService {
  constructor() {}

  public findShareHolderVaultAddresses(receipt: TransactionReceipt) {
    const iface = ShareRolesManager__factory.createInterface()
    return receipt.logs
      .map((log) => {
        try {
          return {
            log: iface.parseLog(log),
            address: log.address,
          }
        } catch {
          /* empty */
        }
      })
      .filter(Boolean)
      .filter((parsed) => parsed?.log?.name === 'ShareHolderVaultCreated')
      .map((parsed) => ({
        shareHolderVaultAddress: parsed?.log?.args.shareHolderVaultAddress,
        shareHolderAddress: parsed?.log?.args.shareHolderAddress,
      }))
  }

  public findShareRolesManagerAddresses(receipt: TransactionReceipt) {
    const iface = ShareRolesManager__factory.createInterface()
    return receipt.logs
      .map((log) => {
        try {
          return {
            log: iface.parseLog(log),
            address: log.address,
          }
        } catch {
          /* empty */
        }
      })
      .filter(Boolean)
      .filter((parsed) => parsed?.log?.name === 'ShareHolderVaultCreated')
      .map((parsed) => parsed?.address)[0]
  }

  public findDistributionAddress(receipt: TransactionReceipt): string | undefined {
    const iface = DistributionStructureFactory__factory.createInterface()
    const logs = receipt.logs
      .map((log) => {
        try {
          return {
            log: iface.parseLog(log),
            address: log.address,
          }
        } catch {
          /* empty */
        }
      })
      .filter(Boolean)
      .filter((parsed) => parsed?.log?.name === 'FundsDistributorCreated')
      .map((parsed) => ({
        fundsDistributorAddress: parsed?.log?.args.fundsDistributorAddress,
      }))
    if (logs.length <= 0) return
    return logs[0].fundsDistributorAddress
  }

  public getDataFromFundsDistributedEvent(receipt: TransactionReceipt): { address: string; amount: string } {
    const iface = FundsDistributor__factory.createInterface()
    const logs = receipt.logs
      .map((log) => {
        try {
          return {
            log: iface.parseLog(log),
            address: log.address,
          }
        } catch {
          /* empty */
        }
      })
      .filter(Boolean)
      .filter((parsed) => parsed?.log?.name === 'FundsDistributed')
      .map((parsed) => ({ address: parsed?.address || '', amount: parsed?.log?.args[0].toString() }))[0]

    return logs
  }
}
