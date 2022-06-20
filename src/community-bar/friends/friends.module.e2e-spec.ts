import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import FriendsRepository from 'src/status/friends.repository';
import MockChatRepository from 'src/chatrooms/repository/mock/mock.chat.repository';
import { UserModule } from 'src/user/user.module.e2e-spec';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

const repositories = [
  {
    provide: getRepositoryToken(FriendsRepository),
    useClass: MockChatRepository,
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
