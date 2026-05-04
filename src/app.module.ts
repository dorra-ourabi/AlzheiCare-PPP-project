import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CalendarModule } from './calendar/calendar.module';
import { IntelligentAssistantModule } from './intelligent-assistant/intelligent-assistant.module';
import { MlClassifierModule } from './ml-classifier/ml-classifier.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './Mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    ChatModule,
    DashboardModule,
    CalendarModule,
    IntelligentAssistantModule,
    MlClassifierModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,UsersModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB_PASS:', configService.get<string>('DB_PASS'));
        console.log('DB_USER:', configService.get<string>('DB_USER'));
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT')),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
