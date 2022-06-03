import { CacheModule, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import ChatParticipantRepository from './repository/chat-participant.repository';
import ChatRepository from './repository/chat.repository';
import ChatroomsController from './chatrooms.controller';
import { ChatroomsGateway } from './chatrooms.gateway';
import ChatroomsService from './chatrooms.service';
import MessageRepository from './repository/message.repository';
import { ChatEventRepository } from './repository/chat-event.repository';
import FriendsRepository from './repository/friends.repository';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({ ttl: 0 }),
  ],
  controllers: [
    ChatroomsController,
  ],
  providers: [
    ChatroomsGateway,
    ChatroomsService,
    ChatRepository,
    MessageRepository,
    ChatParticipantRepository,
    ChatEventRepository,
    FriendsRepository,
  ],
})
export class ChatroomsModule { }
