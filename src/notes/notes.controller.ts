import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'

import { BaseUserGuard } from '../auth/baseUser.guard'

import { NotesService } from './notes.service'
import { CreateFundingNoteDTO } from './notes.dto'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'
import type { NoteEntity } from './notes.entity'

@Controller('notes')
@ApiTags('Notes')
@UseGuards(BaseUserGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Post()
  async createFundingNote(@UserContext() user: UsersEntity, @Body() dto: CreateFundingNoteDTO): Promise<NoteEntity> {
    return this.service.createFundingNote(user.auth0Id, dto)
  }
}
