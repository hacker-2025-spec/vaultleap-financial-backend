import { Module } from '@nestjs/common'

import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { EthRpcModule } from '../eth-rpc/eth-rpc.module'
import { ContractsResolverModule } from '../contractsResolver/contractsResolver.module'
import { EmailSenderModule } from '../email-sender/email-sender.module'

@Module({
  imports: [EthRpcModule, ContractsResolverModule, EmailSenderModule],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
