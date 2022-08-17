import {
  CacheModule, MiddlewareConsumer, Module, NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AlarmModule } from './alarm/alarm.module.e2e-spec';
import AppController from './app.controller';
import AppService from './app.service';
import { AuthModule } from './auth/auth.module.e2e-spec';
import { ChatroomsModule } from './chatrooms/chatrooms.module.e2e-spec';
import { FriendsModule } from './community-bar/friends/friends.module.e2e-spec';
import configuration from './configs/configuration';
import { GameModule } from './game/game.module.e2e-spec';
import { ProfileModule } from './profile/profile.module.e2e-spec';
import { SessionMiddleware } from './session-middleware';
import { StatusModule } from './status/status.module';
import { UserModule } from './user/user.module.e2e-spec';

@Module({
  imports: [
    CacheModule.register({ ttl: 0, isGlobal: true }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ChatroomsModule,
    GameModule,
    UserModule,
    AuthModule,
    FriendsModule,
    AlarmModule,
    ProfileModule,
    StatusModule,
  ],
  controllers: [AppController],
  providers: [AppService, SessionMiddleware],
  exports: [SessionMiddleware],
})
export default class AppModule implements NestModule {
  constructor(public sessionMiddleware: SessionMiddleware) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      this.sessionMiddleware.expressSession,
      this.sessionMiddleware.passportInit,
      this.sessionMiddleware.passportSession,
    ).forRoutes('*');
  }
}
