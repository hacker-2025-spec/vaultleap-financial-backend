import type { VaultsCreatorRequestData } from '../vaults-creator/vaults-creator.types'

export interface MonitorVaultInput {
  State: {
    Name: 'checkIfVaultWasClaimedAfter18Months'
  }
  Event: {
    detail: {
      vaultId: string
    }
  }
}

export interface RemoveSecurityCodeInput {
  State: {
    Name: 'removeTaxFormSecurityCodeAfterTime'
  }
  Event: {
    detail: {
      id: string
    }
  }
}

export interface IteratorInput {
  detail: VaultsCreatorRequestData
  iterator: {
    index: number
    count: number
    continue?: boolean
  }
}

export interface CreateSeparatedVaultInput {
  stepName: 'CreateVault' | 'ProcessCreationStatus' | string
  detail: VaultsCreatorRequestData
  iterator: {
    index: number
    count: number
    continue?: boolean
  }
  taskToken: string
}

export type HandlerInput = MonitorVaultInput
