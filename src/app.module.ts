import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import AppController from './app.controller';
import AppService from './app.service';
import configuration from './configs/configuration';
import TypeOrmConfigService from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game-log/game.module';
import { ChatroomsModule } from './chatrooms/chatrooms.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
