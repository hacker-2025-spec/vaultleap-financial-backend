import type { BridgeVirtualAccountActivityCurrency } from '../../enums/bridge-currency.enum'
import type { BridgePaymentRail } from '../../enums/bridge-payment-rail.enum'
import type { BridgePaymentScheme } from '../../enums/bridge-payment-scheme.enum'
import type { BridgeVirtualAccountEventType } from '../../enums/bridge-virtual-account-event-type.enum'

export class BridgeVirtualAccountActivityResponseDto {
  id: string
  type: BridgeVirtualAccountEventType
  customer_id: string
  virtual_account_id: string
  amount?: string
  currency?: BridgeVirtualAccountActivityCurrency
  developer_fee_amount?: string
  exchange_fee_amount?: string
  subtotal_amount?: string
  gas_fee?: string
  deposit_id?: string
  destination_tx_hash?: string

  source?: {
    payment_rail: BridgePaymentRail
    description?: string
    sender_name?: string
    sender_bank_routing_number?: string
    trace_number?: string
    bank_routing_number?: string
    bank_name?: string
    bank_beneficiary_name?: string
    bank_beneficiary_address?: string
    originator_name?: string
    originator_address?: string
    wire_message?: string
    imad?: string
    bic?: string
    iban?: string
    iban_last_4?: string
    reference?: string
    payment_scheme?: BridgePaymentScheme
    uetr?: string
  }

  created_at: string

  receipt?: {
    initial_amount: string
    developer_fee: string
    exchange_fee: string
    subtotal_amount: string
    remaining_prefunded_balance?: string
    gas_fee?: string
    final_amount?: string
    source_tx_hash?: string
    destination_tx_hash?: string
    exchange_rate?: string
  }
}
