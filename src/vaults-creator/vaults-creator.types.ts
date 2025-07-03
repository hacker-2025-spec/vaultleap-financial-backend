import type { CreatorVaultDto } from './creator-vault.dto'

export enum VaultsCreationStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  REJECTED = 'rejected',
}

export interface VaultsCreatorRequestData {
  id: string
  collection: CreatorVaultDto[]
}
