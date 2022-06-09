import { BadRequestException, CacheModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import ChatroomsService from './chatrooms.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import ChatEventRepository from './repository/chat-event.repository';
import ChatParticipantRepository from './repository/chat-participant.repository';
import ChatRepository from './repository/chat.repository';
import FriendsRepository from './repository/friends.repository';
import MessageRepository from './repository/message.repository';
import MockChatEventRepository from './repository/mock/mock.chat-event.repository';
import MockChatParticipantRepository from './repository/mock/mock.chat-participant.repository';
import MockChatRepository from './repository/mock/mock.chat.repository';
import MockFriendsRepository from './repository/mock/mock.friends.repository';
import MockMessageRepository from './repository/mock/mock.message.repository';

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

describe('Chatrooms 테스트', () => {
  let chatroomsService: ChatroomsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        CacheModule.register({ ttl: 0 }),
      ],
      providers: [
        ChatroomsService,
        ...repositories,
      ],
    }).compile();

    chatroomsService = app.get<ChatroomsService>(ChatroomsService);
  });

  describe('onModuleInit', () => {
    it.todo('muteStopper 검증 추가 예정');
    it.todo('setInitMutedUsers 검증 추가 예정');
    it.todo('setInitBlockedUsers 검증 추가 예정');
  });

  describe('캐시 테스트', () => {
    describe('cacheChatRead', () => {
      it.todo('cacheChatRead 검증 추가 예정');
    });
    describe('cacheChatWrite', () => {
      it.todo('cacheChatWrite 검증 추가 예정');
    });
  });

  describe('뮤트 테스트', () => {
    it.todo('뮤트 검증 추가 예정');
  });

  describe('채팅 관련 테스트', () => {
    test('채팅 저장 - newChat', async () => {
      // given
      const userId = 10;
      const chatId = 0;
      const msg = 'test';

      // when
      const msgId = await chatroomsService.newChat(userId, chatId, msg);

      // then
      expect(msgId).toBe(1);
    });
    describe('getMessages', () => {
      test('get latest messages', async () => {
        // given
        const chatSeq = 0;
        const messageId1 = 10;
        const messageId2 = -1;
        const limit = 2;
        const reqUserSeq = 10;

        // when
        const msgs1 = await chatroomsService.getMessages(chatSeq, messageId1, limit, reqUserSeq);
        const msgs2 = await chatroomsService.getMessages(chatSeq, messageId2, limit, reqUserSeq);

        // then
        expect(msgs1).toEqual(msgs2);
        expect(msgs1.length).toBe(1);
      });
    });
  });

  describe('유저 관련 테스트', () => {
    describe('existUsers', () => {
      it.todo('현재 User 관련 사양이 미정이므로 추후에 검증 예정');
    });
    describe('checkUsers', () => {
      it.todo('현재 User 관련 사양이 미정이므로 추후에 검증 예정');
    });
    describe('setManager', () => {
      it.todo('TBD');
    });
    describe('setNormalUser', () => {
      it.todo('TBD');
    });
    describe('leftUser', () => {
      it.todo('TBD');
    });
    describe('kickUserSave', () => {
      it.todo('TBD');
    });
    describe('isBanned', () => {
      test('기존 차단된 유저인지 확인', async () => {
        // given
        const roomId = 2;
        const userId = 11;

        // when
        const isBanned = await chatroomsService.isBanned(roomId, userId);

        // then
        expect(isBanned).toBeTruthy();
      });
    });
    describe('unbanUser', () => {
      test('기존 차단된 유저 차단 풀기', async () => {
        // given
        const roomId = 2;
        const userId = 11;

        // when
        await chatroomsService.unbanUser(roomId, userId);
        const isBanned = await chatroomsService.isBanned(roomId, userId);

        // then
        expect(isBanned).toBeFalsy();
      });
    });
    describe('banUser', () => {
      test('새 유저 차단하기', async () => {
        // given
        const roomId = 0;
        const adminId = 10;
        const userId = 13;

        // when
        await chatroomsService.banUser(roomId, userId, adminId);
        const isBanned = await chatroomsService.isBanned(roomId, userId);

        // then
        expect(isBanned).toBeFalsy();
      });
    });
  });

  describe('방 관련 테스트', () => {
    describe('existRooms', () => {
      test('exist rooms', async () => {
        // given
        const roomIds = [0, 1, 2];
        // when
        const existRooms = await chatroomsService.existRooms(roomIds);
        // then
        expect(existRooms).toBeTruthy();
      });
      test('not exist rooms', async () => {
        // given
        const roomIds = [3, 4, 5];
        // when
        const existRooms = await chatroomsService.existRooms(roomIds);
        // then
        expect(existRooms).toBeFalsy();
      });
      test('mix', async () => {
        // given
        const roomIds = [0, 3, 1];
        // when
        const existRooms = await chatroomsService.existRooms(roomIds);
        // then
        expect(existRooms).toBeFalsy();
      });
    });

    describe('checkRooms', () => {
      test('exist rooms - not error throw', async () => {
        // given
        const roomIds = [0, 1, 2];
        // when
        try {
          await chatroomsService.checkRooms(roomIds);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('not exist rooms - error throw', async () => {
        // given
        const roomIds = [0, 3];
        // when
        try {
          await chatroomsService.checkRooms(roomIds);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });

    describe('addRoom', () => {
      test('addRoom - room type check #1', async () => {
        // given
        const room: ChatRequestDto = {
          chatType: ChatType.CHTP10,
          chatName: '테스트',
          password: '',
          isDirected: true,
        };
        // when
        try {
          await chatroomsService.addRoom(room);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
      test('addRoom - password check #1', async () => {
        // given
        const room: ChatRequestDto = {
          chatType: ChatType.CHTP30,
          chatName: '테스트',
          password: '1234',
          isDirected: true,
        };
        // when
        try {
          await chatroomsService.addRoom(room);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('addRoom - password check #2', async () => {
        // given
        const room: ChatRequestDto = {
          chatType: ChatType.CHTP20,
          chatName: '테스트',
          password: '1234',
          isDirected: true,
        };
        // when
        try {
          await chatroomsService.addRoom(room);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
      test('addRoom - new room check', async () => {
        // given
        const room: ChatRequestDto = {
          chatType: ChatType.CHTP20,
          chatName: '테스트',
          password: '',
          isDirected: true,
        };
        // when
        const rooms = await chatroomsService.addRoom(room);
        // then
        expect(rooms).toBe(3);
      });
    });

    describe('addDM', () => {
      test('중복 DM 추가', async () => {
        // given
        const user1 = 10;
        const user2 = 20;
        // when
        await chatroomsService.addDM(user1, user2);
        try {
          await chatroomsService.addDM(user2, user1);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });

    describe('addNormalUsers', () => {
      test('중복 사용자 추가', async () => {
        // given
        const roomId = 1;
        const nonExistUser = 100;
        const existUser = 10;
        try {
          // when
          await chatroomsService.addNormalUsers(roomId, [nonExistUser, existUser]);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });

    describe('addOwner', () => {
      test('중복 사용자 추가', async () => {
        // given
        const roomId = 1;
        const existUser = 10;
        try {
          // when
          await chatroomsService.addOwner(roomId, existUser);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
  });

  describe('소켓 관련 테스트', () => {
    describe('onlineUserAdd', () => {
      it.todo('TBD');
    });
    describe('onlineUserRemove', () => {
      it.todo('TBD');
    });
    describe('getUserId', () => {
      it.todo('TBD');
    });
    describe('roomJoin', () => {
      it.todo('TBD');
    });
    describe('roomAddUsers', () => {
      it.todo('TBD');
    });
    describe('roomLeaveUser', () => {
      it.todo('TBD');
    });
    describe('roomLeave', () => {
      it.todo('TBD');
    });
  });

  describe('채팅방 이벤트 관련 테스트', () => {
    describe('userInSave', () => {
      it.todo('TBD');
    });
    describe('userOutSave', () => {
      it.todo('TBD');
    });
  });
});
