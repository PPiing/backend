import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AlarmModule } from './alarm/alarm.module.e2e-spec';
import AppController from './app.controller';
import AppService from './app.service';
import { AuthModule } from './auth/auth.module.e2e-spec';
import { ChatroomsModule } from './chatrooms/chatrooms.module.e2e-spec';
import { FriendsModule } from './community-bar/friends/friends.module.e2e-spec';
import configuration from './configs/configuration';
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
    UserModule,
    AuthModule,
    FriendsModule,
    AlarmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule {}
