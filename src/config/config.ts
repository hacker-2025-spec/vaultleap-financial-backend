import type { DeployedChain } from '@KLYDO-io/getrewards-contracts/deployments'

import type { IConfig } from './config.interface'
import { ConfigKeys, Environment } from './config.interface'

const config = (): IConfig => {
  return {
    [ConfigKeys.ENVIRONMENT]: process.env.NODE_ENV || Environment.DEVELOPMENT,
    [ConfigKeys.REDIRECT_URL]: process.env.REDIRECT_URL || '',
    [ConfigKeys.DATA_MAPPER]: {
      tableNamePrefix: process.env.TABLE_PREFIX ?? '',
    },
    JSON_RPC_URL: process.env.JSON_RPC_URL || '',
    ETHERSCAN_URL: process.env.ETHERSCAN_URL || '',
    [ConfigKeys.KMS_KEY_ID]: process.env.KMS_KEY_ID || '',
    [ConfigKeys.EVM_EVENT_BUS_NAME]: process.env.EVENT_BUS_NAME || '',
    [ConfigKeys.EVM_EVENT_DETAIL_TYPE]: 'evm-transaction-event',
    [ConfigKeys.EVM_EVENT_SOURCE]: 'getrewards.api',
    [ConfigKeys.CHAIN_ID]: Number.parseInt(process.env.CHAIN_ID || '84532') as DeployedChain,
    [ConfigKeys.TAX_FORMS_BUCKET_NAME]: process.env.TAX_FORMS_BUCKET_NAME || '',
    [ConfigKeys.GRAPHQL_API_URL]:
      process.env.GRAPHQL_API_URL || 'https://api.studio.thegraph.com/query/94020/getrewards_stage/version/latest',
    [ConfigKeys.USER_AVATAR_BUCKET_NAME]: process.env.USER_AVATAR_BUCKET_NAME || '',
    [ConfigKeys.BRIDGE_API_KEY]: process.env.BRIDGE_API_KEY || '',
    [ConfigKeys.AWS_REGION]: process.env.AWS_REGION || 'us-east-1',
    [ConfigKeys.BRIDGE_URL]: process.env.BRIDGE_URL || '',
    [ConfigKeys.BRIDGE_WEBHOOK_PUBLIC_KEY]: process.env.BRIDGE_WEBHOOK_PUBLIC_KEY || '',
    [ConfigKeys.PERSONA_API_TOKEN]: process.env.PERSONA_API_TOKEN || '',
    [ConfigKeys.PERSONA_INQUIRY_TEMPLATE_ID]: process.env.PERSONA_INQUIRY_TEMPLATE_ID || '',
    [ConfigKeys.PRIVY_APP_ID]: process.env.PRIVY_APP_ID || '',
    [ConfigKeys.PRIVY_TOKENS_PUBLIC_KEY]: process.env.PRIVY_TOKENS_PUBLIC_KEY || '',
    [ConfigKeys.SUPPORT_EMAIL]: process.env.SUPPORT_EMAIL || 'support@klydo.io',
    [ConfigKeys.SES_SENDER]: process.env.SES_SENDER || '',
    [ConfigKeys.SUMSUB_API_APP_TOKEN]: process.env.SUMSUB_API_APP_TOKEN || '',
    [ConfigKeys.SUMSUB_API_SECRET_KEY]: process.env.SUMSUB_API_SECRET_KEY || '',
    [ConfigKeys.ALCHEMY_API_KEY]: process.env.ALCHEMY_API_KEY || '',
    [ConfigKeys.ALCHEMY_AUTH_TOKEN]: process.env.ALCHEMY_AUTH_TOKEN || '',
    [ConfigKeys.REDIS_HOST]: process.env.REDIS_HOST || '',
    [ConfigKeys.REDIS_PORT]: process.env.REDIS_PORT || '',
    [ConfigKeys.BULL_BOARD_USERNAME]: process.env.BULL_BOARD_USERNAME || '',
    [ConfigKeys.BULL_BOARD_PASSWORD]: process.env.BULL_BOARD_PASSWORD || '',
    [ConfigKeys.IS_OFFLINE]: process.env.IS_OFFLINE || 'false',
    [ConfigKeys.REDIS_TLS]: process.env.REDIS_TLS || 'true',
  }
}

export default config
