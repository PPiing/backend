import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusService } from './status.service';
import { StatusGateway } from './status.gateway';
import FriendsRepository from './repository/friends.repository';
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
