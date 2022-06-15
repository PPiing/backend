import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import AppController from './app.controller';
import AppService from './app.service';
import { ChatroomsModule } from './chatrooms/chatrooms.module.e2e-spec';
import configuration from './configs/configuration';

@Module({
  imports: [
    CacheModule.register({ ttl: 0, isGlobal: true }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ChatroomsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule {}
