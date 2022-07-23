import { BadRequestException, CacheModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { Server, Socket } from 'socket.io';
import { Manager } from 'socket.io-client';
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
  let schedulerRegistry: SchedulerRegistry;

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
    schedulerRegistry = app.get<SchedulerRegistry>(SchedulerRegistry);
    await chatroomsService.onModuleInit();
  });

  afterEach(async () => {
    // 스케쥴러가 남아있으면 테스트가 비정상적으로 종료되므로 남아있는 스케쥴러를 모두 제거한다.
    const cronJobs = schedulerRegistry.getCronJobs();
    const timeouts = schedulerRegistry.getTimeouts();
    const intervals = schedulerRegistry.getIntervals();
    cronJobs.forEach((_, name) => {
      schedulerRegistry.deleteCronJob(name);
    });
    timeouts.forEach((name) => {
      schedulerRegistry.deleteTimeout(name);
    });
    intervals.forEach((name) => {
      schedulerRegistry.deleteInterval(name);
    });
  });

  describe('cron 스케쥴러 테스트', () => {
    it.todo('현재 사용하는 스케쥴러 등록 방식이 모킹 모듈을 만들 때 적용이 안되는듯... 추후 재검토 필요');
  });

  describe('캐시 테스트', () => {
    describe('cacheChatRead', () => {
      it.todo('cacheChatRead 검증 추가 예정');
    });
    describe('cacheChatWrite', () => {
      it.todo('cacheChatWrite 검증 추가 예정');
    });
  });

  describe('onModuleInit', () => {
    describe('muteStopper', () => {
      beforeAll(async () => {
        jest.useFakeTimers(); // using mock timers https://jestjs.io/docs/timer-mocks
      });
      test('뮤트가 만료될 경우 만료된 유저는 뮤트를 해제해야 함.', async () => {
        // given
        // 0번 채팅방에서 유저 10번이 유저 1번에게 1분동안 뮤트 당함
        // 1번 채팅방에서 유저 11번이 유저 10번에게 5분동안 뮤트 당함
        const room0 = 0;
        const room1 = 1;
        const user10 = 10;
        const user11 = 11;

        // when, then
        // 10, 11 모두 mute 상태이어야 함.
        expect(await chatroomsService.isMuted(room0, user10)).toBeTruthy();
        expect(await chatroomsService.isMuted(room1, user11)).toBeTruthy();

        // 1분 후에 유저 10번은 뮤트가 만료되어야 함.
        jest.advanceTimersByTime(60 * 1000); // timer fast-forward
        expect(await chatroomsService.isMuted(room0, user10)).toBeFalsy();
        expect(await chatroomsService.isMuted(room1, user11)).toBeTruthy();

        // 4분 후에 유저 11번도 뮤트가 만료되어야 함.
        jest.advanceTimersByTime(4 * 60 * 1000); // timer fast-forward
        expect(await chatroomsService.isMuted(room0, user10)).toBeFalsy();
        expect(await chatroomsService.isMuted(room1, user11)).toBeFalsy();
      });
      afterAll(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
      });
    });
    describe('setInitMutedUsers', () => {
      test('정상적으로 캐시할경우 뮤트되어 있어야 함', async () => {
        // given
        // 0번 채팅방에서 유저 10번이 유저 1번에게 1분동안 뮤트 당함
        // 1번 채팅방에서 유저 11번이 유저 10번에게 5분동안 뮤트 당함
        const room0 = 0;
        const room1 = 1;
        const user10 = 10;
        const user11 = 11;
        // when, then
        expect(await chatroomsService.isMuted(room0, user10)).toBeTruthy();
        expect(await chatroomsService.isMuted(room1, user11)).toBeTruthy();
      });
    });
    describe('setInitBlockedUsers', () => {
      test('정상적으로 캐시할경우 차단되어 있어야 함', async () => {
        // given
        const blockedUser = 11;
        const blockUser = 10;

        // when
        const who = await chatroomsService.getBlockedUsers(blockedUser);

        // then
        expect(who).toContain(blockUser);
      });
    });
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
    describe('muteUser / isMuted', () => {
      beforeAll(async () => {
        jest.useFakeTimers(); // using mock timers https://jestjs.io/docs/timer-mocks
      });
      test('뮤트 유저 추가/뮤트 체크', async () => {
        // given
        const chatSeq = 0;
        const to = 10;
        const admin = 11;
        const time = 60;

        // when
        await chatroomsService.muteUser(
          chatSeq,
          to,
          admin,
          time,
        );
        // 올바른 방
        const mutedUser1 = await chatroomsService.isMuted(chatSeq, to);
        // 다른 방
        const mutedUser2 = await chatroomsService.isMuted(1, to);
        // 다른 유저
        const mutedUser3 = await chatroomsService.isMuted(chatSeq, 11);

        // then
        expect(mutedUser1).toBeTruthy();
        expect(mutedUser2).toBeFalsy();
        expect(mutedUser3).toBeFalsy();
      });
      test('시간 지날시 뮤트 풀리는지 체크', async () => {
        // given
        const chatSeq = 0;
        const to = 10;
        const admin = 11;
        const time = 60;

        // when
        await chatroomsService.muteUser(
          chatSeq,
          to,
          admin,
          time,
        );
        jest.advanceTimersByTime(time * 1000); // timer fast-forward
        const mutedUser = await chatroomsService.isMuted(chatSeq, to);
        // then
        expect(mutedUser).toBeFalsy();
      });
      afterAll(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
      });
    });
  });

  describe('블럭 테스트', () => {
    describe('getBlockedUsers', () => {
      test('차단 목록 추출', async () => {
        // given
        const blockedUser = 11;
        const blockUser = 10;

        // when
        const who = await chatroomsService.getBlockedUsers(blockedUser);

        // then
        expect(who).toContain(blockUser);
      });
    });
    describe('getBlockedSocketIdList', () => {
      it.todo('TBD');
    });
    describe('blockUser', () => {
      test('차단 유저 추가', async () => {
        // given
        const blockedUser = 12;
        const blockUser = 13;

        // when
        const block = await chatroomsService.blockUser(blockUser, blockedUser);

        // then
        const who = await chatroomsService.getBlockedUsers(blockedUser);
        expect(block).toBeTruthy();
        expect(who).toContain(blockUser);
      });
    });
    describe('unblockUser', () => {
      test('차단 해제', async () => {
        // given
        const blockedUser = 11;
        const blockUser = 10;

        // when
        const block = await chatroomsService.unblockUser(blockUser, blockedUser);

        // then
        const who = await chatroomsService.getBlockedUsers(blockedUser);
        expect(block).toBeTruthy();
        expect(who).not.toContain(blockUser);
      });
    });
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
    test('setManager', async () => {
      // given
      const userSeq = 11;
      const chatSeq = 0;
      // when
      await chatroomsService.setManager(chatSeq, userSeq);
      // then
      const auth = await chatroomsService.getUserAuth(chatSeq, userSeq);
      expect(auth).toEqual(PartcAuth.CPAU20);
    });
    test('setNormalUser', async () => {
      // given
      const userSeq = 10;
      const chatSeq = 0;
      // when
      await chatroomsService.setNormalUser(chatSeq, userSeq);
      // then
      const auth = await chatroomsService.getUserAuth(chatSeq, userSeq);
      expect(auth).toEqual(PartcAuth.CPAU10);
    });
    test('leftUser', async () => {
      // given
      const userSeq = 10;
      const chatSeq = 0;
      // when
      const result = await chatroomsService.leftUser(chatSeq, userSeq);
      // then
      expect(result).toBeTruthy();
    });
    describe('kickUserSave', () => {
      it.todo('킥 내용을 별도로 조회하지 않음');
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

    describe('joinRoomByExUser', () => {
      test('방 입장 테스트 - 올바른 정보', async () => {
        // given
        const roomId = 1;
        const user = 14;
        const password = 'puju';

        // when
        const room = await chatroomsService.joinRoomByExUser(roomId, user, password);

        // then
        expect(room).toBeTruthy();
      });
      test('방 입장 테스트 - 이미 존재하는 사용자', async () => {
        // given
        const roomId = 1;
        const user = 10;
        const password = 'puju';

        try {
          // when
          await chatroomsService.joinRoomByExUser(roomId, user, password);
          throw new Error('예외가 발생하지 않았습니다.');
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
      test('방 입장 테스트 - 틀린 비밀번호', async () => {
        // given
        const roomId = 1;
        const user = 14;
        const password = 'puju1';

        // when
        const room = await chatroomsService.joinRoomByExUser(roomId, user, password);

        // then
        expect(room).toBeFalsy();
      });
    });

    describe('getRoomType', () => {
      test('존재하는 방 종류 확인', async () => {
        // given
        const roomId = 1;
        // when
        const roomType = await chatroomsService.getRoomType(roomId);
        // then
        expect(roomType).toBe(ChatType.CHTP30);
      });
      test('존재하지 않는 방 종류 확인', async () => {
        // given
        const roomId = 123;
        // when
        const roomType = await chatroomsService.getRoomType(roomId);
        // then
        expect(roomType).toBeUndefined();
      });
    });

    describe('searchChatroom', () => {
      test('방 조회', async () => {
        // when
        const room = await chatroomsService.searchChatroom();
        // then
        expect(room).toHaveLength(2);
        expect(room[0].participants).toHaveLength(2);
      });
    });

    describe('getRoomInfo', () => {
      test('특정 방 조회', async () => {
        // given
        const chatSeq = 0;
        // when
        const room = await chatroomsService.getRoomInfo(chatSeq);
        // then
        expect(room.chatType).toEqual(ChatType.CHTP20);
        expect(room.participants).toHaveLength(2);
      });
    });

    describe('getRoomParticipantsCount', () => {
      test('방 인원수 조회', async () => {
        // given
        const chatSeq = 0;
        // when
        const room = await chatroomsService.getRoomParticipantsCount(chatSeq);
        // then
        expect(room).toEqual(2);
      });
    });

    describe('deleteRoom', () => {
      test('방 삭제', async () => {
        // given
        const chatSeq = 2;
        // when
        await chatroomsService.deleteRoom(chatSeq);
        // then
        const existRooms = await chatroomsService.existRooms([chatSeq]);
        expect(existRooms).toBeFalsy();
      });
    });

    describe('getNextAdmin', () => {
      test('방 인원이 두명인 경우', async () => {
        // given
        const chatSeq = 0;
        // when
        const nextAdmin = await chatroomsService.getNextAdmin(chatSeq);
        // then
        expect(nextAdmin).toEqual(11);
      });
    });

    describe('getUserAuth', () => {
      test('방장', async () => {
        // given
        const userSeq = 10;
        const chatSeq = 0;
        // when
        const auth = await chatroomsService.getUserAuth(chatSeq, userSeq);
        // then
        expect(auth).toEqual(PartcAuth.CPAU30);
      });
      test('일반 유저', async () => {
        // given
        const userSeq = 11;
        const chatSeq = 0;
        // when
        const auth = await chatroomsService.getUserAuth(chatSeq, userSeq);
        // then
        expect(auth).toEqual(PartcAuth.CPAU10);
      });
    });

    describe('isParticipant', () => {
      test('참여한 사람', async () => {
        // given
        const userSeq = 10;
        const chatSeq = 0;
        // when
        const parti = await chatroomsService.isParticipant(chatSeq, userSeq);
        // then
        expect(parti).toBeTruthy();
      });
      test('참여하지 않은 사람', async () => {
        // given
        const userSeq = 12;
        const chatSeq = 1;
        // when
        const parti = await chatroomsService.isParticipant(chatSeq, userSeq);
        // then
        expect(parti).toBeFalsy();
      });
    });

    describe('isMaster / isManager / isNormalUser', () => {
      test('방장', async () => {
        // given
        const userSeq = 10;
        const chatSeq = 0;
        // when
        const auth1 = await chatroomsService.isMaster(chatSeq, userSeq);
        const auth2 = await chatroomsService.isManager(chatSeq, userSeq);
        const auth3 = await chatroomsService.isNormalUser(chatSeq, userSeq);
        // then
        expect(auth1).toBeTruthy();
        expect(auth2).toBeFalsy();
        expect(auth3).toBeFalsy();
      });
      test('관리자', async () => {
        // given
        const userSeq = 11;
        const chatSeq = 1;
        // when
        const auth1 = await chatroomsService.isMaster(chatSeq, userSeq);
        const auth2 = await chatroomsService.isManager(chatSeq, userSeq);
        const auth3 = await chatroomsService.isNormalUser(chatSeq, userSeq);
        // then
        expect(auth1).toBeFalsy();
        expect(auth2).toBeTruthy();
        expect(auth3).toBeFalsy();
      });
      test('일반 유저', async () => {
        // given
        const userSeq = 11;
        const chatSeq = 0;
        // when
        const auth1 = await chatroomsService.isMaster(chatSeq, userSeq);
        const auth2 = await chatroomsService.isManager(chatSeq, userSeq);
        const auth3 = await chatroomsService.isNormalUser(chatSeq, userSeq);
        // then
        expect(auth1).toBeFalsy();
        expect(auth2).toBeFalsy();
        expect(auth3).toBeTruthy();
      });
    });
  });

  describe('소켓 관련 테스트', () => {
    let io;
    let clientSocket;

    beforeEach((done) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const { port } = httpServer.address() as AddressInfo;
        clientSocket = new Manager(`http://localhost:${port}`).socket('/');
        done();
      });
    });

    afterEach(() => {
      io.close();
      clientSocket.close();
    });

    describe('onlineUserAdd / onlineUserRemove / whoAmI', () => {
      test('사용자 접속 및 접속 해제', (done) => {
        // given
        const userId = 10;

        let soc;

        io.on('connection', async (socket: Socket) => {
          // when
          socket.on('disconnect', async () => {
            await chatroomsService.onlineUserRemove(socket);
            soc = await chatroomsService.whoAmI(socket.id);
            // then
            expect(soc).toBeFalsy();
            done();
          });
          await chatroomsService.onlineUserAdd(socket, userId);
          const onlineUser = await chatroomsService.whoAmI(socket.id);
          expect(userId).toEqual(onlineUser);
          soc.close();
        });
        // when
        soc = clientSocket.connect();
      });
    });
    describe('roomJoin', () => {
      test('룸 조인', (done) => {
        // given
        const userId = 10;
        io.on('connection', async (socket: Socket) => {
          // when
          const rooms = await chatroomsService.roomJoin(socket, userId);
          // then
          expect(rooms).toEqual([0, 1]);
          done();
        });
        clientSocket.connect();
      });
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
      it.todo('읽어오는 동작이 없어 테스트하지 않음.');
    });
    describe('userOutSave', () => {
      it.todo('읽어오는 동작이 없어 테스트하지 않음.');
    });
  });
});
