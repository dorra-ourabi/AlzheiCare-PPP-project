import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IntelligentAssistantController } from './intelligent-assistant.controller';
import { IntelligentAssistantService } from './intelligent-assistant.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [IntelligentAssistantController],
  providers: [IntelligentAssistantService],
  exports: [IntelligentAssistantService],
})
export class IntelligentAssistantModule {}
