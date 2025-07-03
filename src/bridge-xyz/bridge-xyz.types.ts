export enum DrainCurrency {
  USDB = 'usdb',
  USDC = 'usdc',
  USDT = 'usdt',
  DAI = 'dai',
  USD = 'usd',
  EUR = 'eur',
  EURC = 'eurc',
  PYUSD = 'pyusd',
}

export enum LiquidationChain {
  BASE = 'base',
}

export enum LiquidationCurrency {
  USDC = 'usdc',
  USDT = 'usdt',
  EURC = 'eurc',
}

export enum FiatCurrency {
  USD = 'usd',
  EUR = 'eur',
}

export enum PaymentRail {
  ACH = 'ach',
  WIRE = 'wire',
  SEPA = 'sepa',
  BASE = 'base',
}

export enum VirtualAccountActivityCurrency {
  USDB = 'usdb',
  USDC = 'usdc',
  USDT = 'usdt',
  DAI = 'dai',
  USD = 'usd',
  PYUSD = 'pyusd',
}

export enum DrainState {
  AWAITING_FUNDS = 'awaiting_funds',
  IN_REVIEW = 'in_review',
  FUNDS_RECEIVED = 'funds_received',
  PAYMENT_SUBMITTED = 'payment_submitted',
  PAYMENT_PROCESSED = 'payment_processed',
  CANCELED = 'canceled',
  ERROR = 'error',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
}

export enum VirtualAddressActivityType {
  PAYMENT_PROCESSED = 'payment_processed',
}
