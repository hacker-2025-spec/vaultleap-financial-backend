/* eslint-disable no-await-in-loop */
import { DataMapper } from '@nova-odm/mapper'
import type { OnModuleInit } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common'

import { UsersEntity } from '../../users/users.entity'
import { AlchemyClientService } from './alchemy-client.service'

@Injectable()
export class AlchemyWebhookAdminService implements OnModuleInit {
  constructor(
    private readonly alchemyClient: AlchemyClientService,
    @Inject(DataMapper) private readonly dataMapper: DataMapper
  ) {}

  async onModuleInit() {
    await this.syncAlchemyWebhooksForAllEnvs()
  }

  async syncAlchemyWebhooksForAllEnvs(): Promise<void> {
    const allUsers = await this.getAllUsersWithWallets()
    const addresses: string[] = allUsers.map((u) => u.privySmartWalletAddress).filter((addr): addr is string => typeof addr === 'string')
    await this.alchemyClient.updateWebhook(addresses)
  }

  private async getAllUsersWithWallets(): Promise<UsersEntity[]> {
    const users: UsersEntity[] = []
    const iterator = this.dataMapper.scan(UsersEntity)

    for await (const user of iterator) {
      if (user.privySmartWalletAddress) {
        users.push(user)
      }
    }

    return users
  }
}
