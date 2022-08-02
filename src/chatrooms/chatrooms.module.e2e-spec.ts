import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { getRepositoryToken } from '@nestjs/typeorm';
import AppModule from 'src/app.module.e2e-spec';
import { UserModule } from 'src/user/user.module.e2e-spec';
import ChatParticipantRepository from './repository/chat-participant.repository';
import ChatRepository from './repository/chat.repository';
import ChatroomsController from './chatrooms.controller';
import { ChatroomsGateway } from './chatrooms.gateway';
import MessageRepository from './repository/message.repository';
import ChatEventRepository from './repository/chat-event.repository';
import FriendsRepository from './repository/friends.repository';
import MockChatRepository from './repository/mock/mock.chat.repository';
import MockChatEventRepository from './repository/mock/mock.chat-event.repository';
import MockMessageRepository from './repository/mock/mock.message.repository';
import MockChatParticipantRepository from './repository/mock/mock.chat-participant.repository';
import MockFriendsRepository from './repository/mock/mock.friends.repository';
import ChatroomsService from './chatrooms.service';

const repositories = [
  {
    provide: getRepositoryToken(ChatRepository),
    useClass: MockChatRepository,
  },
  {
    provide: getRepositoryToken(ChatEventRepository),
    useClass: MockChatEventRepository,
  },
  {
    provide: getRepositoryToken(MessageRepository),
    useClass: MockMessageRepository,
  },
  {
    provide: getRepositoryToken(ChatParticipantRepository),
    useClass: MockChatParticipantRepository,
  },
  {
    provide: getRepositoryToken(FriendsRepository),
    useClass: MockFriendsRepository,
  },
];

@Module({
  imports: [
    forwardRef(() => AppModule),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({ ttl: 0 }),
    UserModule,
  ],
  controllers: [
    ChatroomsController,
  ],
  providers: [
    ChatroomsGateway,
    ChatroomsService,
    ...repositories,
  ],
})
export class ChatroomsModule { }
