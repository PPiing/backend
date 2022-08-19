import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsRepository } from 'src/community-bar/friends/repository/friends.repository';
import { StatusService } from './status.service';
import { StatusGateway } from './status.gateway';
import UserStatusRepository from './repository/user-status.repository';

@Module({
  imports: [
    forwardRef(() => AppModule),
    CacheModule.register({ ttl: 0 }),
    TypeOrmModule.forFeature([
      FriendsRepository,
      UserStatusRepository,
    ]),
  ],
  providers: [
    StatusGateway,
    StatusService,
  ],
})
export class StatusModule { }
