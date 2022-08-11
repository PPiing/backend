import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ProfileModule } from 'src/profile/profile.module';
import { AppModule } from 'src/app.module';
import { AlarmModule } from 'src/alarm/alarm.module';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsRepository } from './repository/friends.repository';
import { FriendsGateway } from './friends.gateway';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => UserModule),
    forwardRef(() => ProfileModule),
    forwardRef(() => AlarmModule),
    CacheModule.register({ ttl: 0 }),
    TypeOrmModule.forFeature([
      FriendsRepository,
    ]),
  ],
  controllers: [
    FriendsController,
  ],
  providers: [
    FriendsGateway,
    FriendsService,
  ],
  exports: [
    FriendsService,
  ],
})
export class FriendsModule {}
