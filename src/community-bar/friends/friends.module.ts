import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import FriendsRepository from 'src/status/friends.repository';
import MockChatRepository from 'src/chatrooms/repository/mock/mock.chat.repository';

const repositories = [
  {
    provide: getRepositoryToken(FriendsRepository),
    useClass: MockChatRepository,
  }
]
@Module({
  controllers: [FriendsController],
  providers: [
    FriendsService,
    ...repositories,
  ],
})
export class FriendsModule {}
