import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CalendarModule } from './calendar/calendar.module';
import { IntelligentAssistantModule } from './intelligent-assistant/intelligent-assistant.module';
import { MlClassifierModule } from './ml-classifier/ml-classifier.module';

@Module({
  imports: [UsersModule, AuthModule, ChatModule, DashboardModule, CalendarModule, IntelligentAssistantModule, MlClassifierModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
