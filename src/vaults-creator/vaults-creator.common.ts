export enum VaultsCreationStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  REJECTED = 'rejected',
}

export interface VaultsCreatorRequestData {
  id: string
  collection: any[] // Using any to avoid circular dependency
}
