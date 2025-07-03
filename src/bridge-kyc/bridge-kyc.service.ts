import { DataMapper } from '@nova-odm/mapper'
import { Inject, Injectable, Logger } from '@nestjs/common'

import { BridgeKYCEntity } from './bridge-kyc.entity'
import type { CreateCustomerFromKycResponseDTO } from '../bridge-xyz/bridge-xyz.dto'
import { replaceNullsWithEmptyStrings } from '../utils/helpers'

@Injectable()
export class BridgeKYCService {
  private readonly logger = new Logger(BridgeKYCService.name)
  public constructor(@Inject(DataMapper) protected dataMapper: DataMapper) {}

  async getBridgeKYC(auth0Id: string): Promise<BridgeKYCEntity | null> {
    return await this.dataMapper.get(Object.assign(new BridgeKYCEntity(), { auth0Id })).catch(() => null)
  }

  async saveBridgeKYC(auth0Id: string, { id, ...kycLinkData }: CreateCustomerFromKycResponseDTO): Promise<BridgeKYCEntity> {
    try {
      const alreadyExistedItem = await this.getBridgeKYC(auth0Id).catch(() => null)
      if (alreadyExistedItem) {
        this.logger.log(`BridgeKYCService -> saveBridgeKYC -> record with auth0 already existed`)
        return alreadyExistedItem
      }
      const newKycLinkData = Object.assign(new BridgeKYCEntity(), {
        auth0Id,
        bridgeKycId: id,
        ...replaceNullsWithEmptyStrings(kycLinkData),
      })
      return await this.dataMapper.put(newKycLinkData)
    } catch (error) {
      this.logger.error(`BridgeKYCService -> saveBridgeKYC -> auth0Id: ${auth0Id}`, error)
      throw error
    }
  }

  async updateBridgeKYC(auth0Id: string, { id, ...kycLinkData }: CreateCustomerFromKycResponseDTO): Promise<BridgeKYCEntity> {
    try {
      const newKycLinkData = Object.assign(new BridgeKYCEntity(), {
        auth0Id,
        bridgeKycId: id,
        ...replaceNullsWithEmptyStrings(kycLinkData),
      })
      return await this.dataMapper.put(newKycLinkData)
    } catch (error) {
      this.logger.error(`BridgeKYCService -> saveBridgeKYC -> auth0Id: ${auth0Id}`, error)
      throw error
    }
  }
}
