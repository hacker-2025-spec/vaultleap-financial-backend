export interface CoinGeckoResponse {
  'usd-coin': {
    usd: number
  }
  tether: {
    usd: number
  }
  'euro-coin': {
    usd: number
  }
}

export interface ForexRate {
  symbol: string
  usdRate: number
  lastUpdated: number
}

export interface ForexRatesCache {
  usdt: {
    usd: number
    eur: number
  }
  usdc: {
    usd: number
    eur: number
  }
  eurc: {
    usd: number
    eur: number
  }
  lastUpdated: number
}
