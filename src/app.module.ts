import {
  CacheModule, MiddlewareConsumer, Module, NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import AppController from './app.controller';
import AppService from './app.service';
import configuration from './configs/configuration';
import TypeOrmConfigService from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { ChatroomsModule } from './chatrooms/chatrooms.module';
import { CommunityBarModule } from './community-bar/community-bar.module';
import { ProfileModule } from './profile/profile.module';
import { SessionMiddleware } from './session-middleware';
import { AlarmModule } from './alarm/alarm.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    CacheModule.register({ ttl: 0, isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    UserModule,
    GameModule,
    AuthModule,
    ChatroomsModule,
    StatusModule,
    CommunityBarModule,
    AlarmModule,
    ProfileModule,
    UploadModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, SessionMiddleware],
  exports: [SessionMiddleware],
})
export class AppModule implements NestModule {
  constructor(public sessionMiddleware: SessionMiddleware) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      this.sessionMiddleware.expressSession,
      this.sessionMiddleware.passportInit,
      this.sessionMiddleware.passportSession,
    ).forRoutes('*');
  }
}
