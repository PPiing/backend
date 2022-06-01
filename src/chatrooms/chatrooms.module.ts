import { CacheModule, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import ChatParticipantRepository from './chat-participant.repository';
import ChatRepository from './chat.repository';
import ChatroomsController from './chatrooms.controller';
import { ChatroomsGateway } from './chatrooms.gateway';
import ChatroomsService from './chatrooms.service';
import MessageRepository from './message.repository';

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
  ],
})
export class ChatroomsModule { }
