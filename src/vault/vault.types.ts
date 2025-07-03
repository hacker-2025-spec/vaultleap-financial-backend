export type OwnershipType = {
  shareTokenOwnerships: ShareTokenOwnershipsType[]
}

export type ShareTokenOwnershipsType = {
  id: string
  amount: number
  tokenAddress: string
  tokenId: string
  walletAddress: string
}

export type AggregatedClaimsType = {
  aggregatedClaimsPerUserPerYears: AggregatedClaimsPerUserPerYearsType[]
}

export type AggregatedClaimsPerUserPerYearsType = {
  amount: string
  id: string
  vaultAddress: string
  year: string
}

export type AggregatedFundsType = {
  aggregatedFundsPerVaultPerDays: AggregatedFundsPerVaultPerDayType[]
}

export type AggregatedFundsPerVaultPerDayType = {
  id: string
  amount: string
  month: string
  day: string
  year: string
  vaultAddress: string
}

export enum VaultUserRole {
  MANAGER = 'manager',
  CONTRACTOR = 'contractor',
}
