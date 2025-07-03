import { DataMapper } from '@nova-odm/mapper'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'

import { MSG } from '../consts/exceptions-messages'
import { BankingInfoEntity } from './banking-info.entity'
import type { CreateUsExternalAccountResponseDTO, CreateIbanExternalAccountResponseDTO } from '../bridge-xyz/bridge-xyz.dto'
import { replaceNullsWithEmptyStrings } from '../utils/helpers'

@Injectable()
export class BankingInfoService {
  private readonly logger = new Logger(BankingInfoService.name)
  public constructor(@Inject(DataMapper) protected dataMapper: DataMapper) {}

  async saveBankingInfo(
    auth0Id: string,
    externalAccount: CreateUsExternalAccountResponseDTO | CreateIbanExternalAccountResponseDTO
  ): Promise<BankingInfoEntity> {
    this.logger.log(`BankingInfoService -> saveBankingInfo`)

    const newBankingInfo = Object.assign(new BankingInfoEntity(), {
      auth0Id,
      ...replaceNullsWithEmptyStrings(externalAccount),
    })
    return await this.dataMapper.put(newBankingInfo)
  }

  async getBankingInfoByAuth0Id(auth0Id: string): Promise<BankingInfoEntity[]> {
    try {
      const iterator = this.dataMapper.query(BankingInfoEntity, { auth0Id })

      const results = []
      for await (const record of iterator) {
        results.push(record)
      }
      return results
    } catch {
      this.logger.error(`BankingInfoService -> getBankingInfoByAuth0Id -> banking info for auth0Id: ${auth0Id} not found`)
      throw new BadRequestException(MSG.BANKING_INFO_NOT_FOUND)
    }
  }

  async getBankingInfoById(auth0Id: string, id: string): Promise<BankingInfoEntity> {
    try {
      return await this.dataMapper.get(Object.assign(new BankingInfoEntity(), { auth0Id, id }))
    } catch {
      this.logger.error(`BankingInfoService -> getBankingInfoById -> banking info for auth0Id: ${auth0Id} and id: ${id} not found`)
      throw new BadRequestException(MSG.BANKING_INFO_NOT_FOUND)
    }
  }
}
