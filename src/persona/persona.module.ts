import { Module } from '@nestjs/common'
import { PersonaService } from './persona.service'
import { HttpModule } from '@nestjs/axios'
import { PersonaController } from './persona.controller'

@Module({
  providers: [PersonaService],
  exports: [PersonaService],
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [PersonaController],
})
export class PersonaModule {}
