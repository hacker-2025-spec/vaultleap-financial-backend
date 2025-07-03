import { DataMapper } from '@nova-odm/mapper'
import { Injectable, Logger } from '@nestjs/common'

import { queryRecords } from '../utils/dynamoDbHelpers'

import { AuditEntity } from './audit.entity'
import type { AuditAccessEventDto } from './audit.dto'

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)
  constructor(private readonly dataMapper: DataMapper) {}

  async addAudit(taxFormId: string, auth0Id: string, accessEvent: AuditAccessEventDto): Promise<AuditEntity> {
    this.logger.log('AuditService => addAudit => taxFormId', taxFormId)
    this.logger.log('AuditService => addAudit => auth0Id', auth0Id)
    this.logger.log('AuditService => addAudit => accessEvent', JSON.stringify(accessEvent))
    const matchingAuditList = await queryRecords(this.dataMapper, { taxFormId }, { indexName: 'taxFormIdIndex' }, AuditEntity)
    const matchingAudit = matchingAuditList.find((audit) => audit.auth0Id === auth0Id)
    this.logger.log('AuditService => addAudit => matchingAudit', JSON.stringify(matchingAudit))

    if (!matchingAudit) {
      return await this.dataMapper.put(
        Object.assign(new AuditEntity(), {
          taxFormId,
          auth0Id,
          accessEvents: [accessEvent],
        })
      )
    }
    return await this.dataMapper.update(
      Object.assign(new AuditEntity(), {
        ...matchingAudit,
        accessEvents: [...matchingAudit.accessEvents, accessEvent],
      })
    )
  }
}
