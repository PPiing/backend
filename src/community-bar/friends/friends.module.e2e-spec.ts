import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module.e2e-spec';
import { FriendsController } from './friends.controller';
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
    UserModule,
  ],
  controllers: [FriendsController],
  providers: [
    FriendsService,
    ...repositories,
  ],
})
export class FriendsModule {}