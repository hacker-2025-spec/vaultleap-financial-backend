import type { FedTaxClassification } from '../tax-info/tax-info.types'

export type TaxFormUserData = {
  name: string
  address: string
  city: string
  state: string
  zip: string
  ssn?: string
  ein?: string
  country: string
}

export type Form1099Data = {
  payerDetails: TaxFormUserData
  recipientDetails: TaxFormUserData
  compensation: string
  year: string
}

export type FormW9Data = TaxFormUserData & {
  businessName?: string
  fedTaxClassification?: FedTaxClassification
  llcClassification?: string
  otherClassification?: string
  payeeCode?: string
  exemptionCode?: string
  ssn?: string
  ein?: string
  signature?: string
  date?: string
}
