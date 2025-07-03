export type FundsSendEmailParams = {
  fullName: string
  email: string
  transactionId: string
  transactionLink: string
  vaultName: string
  amount: string
  date: string
  link: string
  memo?: string
}

export enum EmailLogStatusesEnum {
  START = 'sending_start',
  END = 'sending_end',
  FAIL = 'sending_fail',
}

export type EmailLogItem = {
  type: string
  to: string
  time: number
}

export type DirectVaultCreationEmailParams = {
  creatorFullName: string
  vaultAddress: string
  email: string
  bankInfo: {
    accountOwnerName: string
    bankName: string
  } & (
    | {
        iban: {
          bic: string
          countryCode: string
          last4: string
          accountOwnerType: 'individual' | 'business'
          firstName?: string
          lastName?: string
          businessName?: string
        }
      }
    | {
        account: {
          routingNumber: string
          last4: string
        }
      }
  )
  vaultFeePercentage: number
}

export type DirectVaultFundsSentEmailParams = {
  fullName: string
  vaultName: string
  amount: string
  date: string
  email: string
}

export type VirtualAccountFundsSentEmailParams = {
  fullName: string
  vaultName: string
  amount: string
  date: string
  currency: string
  email: string
}

export type VirtualAccountCreationEmailParams = {
  creatorFullName: string
  email: string
  vaultFeePercentage: number

  destination: {
    paymentRail: string
    vaultAddress: string
    currency: string
  }

  source: {
    bankName: string
    accountHolderName?: string
    bankBeneficiaryName?: string
    currency: string
  } & (
    | {
        bic: string
        iban: string
      }
    | {
        routingNumber: string
        accountNumber: string
      }
  )
}
