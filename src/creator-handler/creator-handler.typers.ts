// Todo: Move to getrewards-contracts in future

export type TShareOwnerStruct = {
  tokenId: number
  owner: string
}

export type TVaultCreationData = {
  distributionName: string
  distributionStartThreshold: number
  thresholdVaultAddress: string
  klydoVaultFee: number
  uri: string
  sharesDistributionPercentage: number[]
  shareOwners: TShareOwnerStruct[]
  auth0Id: string
  walletAddress: string
  taskToken?: string
}
