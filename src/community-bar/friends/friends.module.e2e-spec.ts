import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module.e2e-spec';
import { UserModule } from 'src/user/user.module.e2e-spec';
import { FriendsController } from './friends.controller';
import { FriendsGateway } from './friends.gateway';
import { FriendsService } from './friends.service';
import { FriendsRepository } from './repository/friends.repository';
import MockFriendsRepository from './repository/mock/mock.friends.repository';

const repositories = [
  {
    provide: getRepositoryToken(FriendsRepository),
    useClass: MockFriendsRepository,
  },
];

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProfileModule),
    CacheModule.register({ ttl: 0 }),
  ],
  controllers: [
    FriendsController,
  ],
  providers: [
    FriendsService,
    FriendsGateway,
    ...repositories,
  ],
  exports: [
    FriendsService,
  ],
})
export class FriendsModule {}
