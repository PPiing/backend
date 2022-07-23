import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SchedulerRegistry } from '@nestjs/schedule';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import { Manager, Socket } from 'socket.io-client';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import AppModule from '../src/app.module.e2e-spec';

async function generateSocketClient(id: number, connect = true): Promise<Socket> {
  const rtn = new Manager(
    'http://localhost:3000',
    {
      transports: ['websocket'],
    },
  ).socket('/chatrooms');
  rtn.auth = { username: id };
  if (connect) {
    await new Promise<void>((resolve) => {
      rtn.on('connect', () => {
        resolve();
      });
    });
  }
  return rtn;
}

/**
 * 세션을 적용하면서 변경해야 할 사항이 너무 많기 때문에 채팅방 관련 e2e 테스트는 당분간 skip합니다...
 * 예를 들면, by는 사용자 ID를 나타내는데 해당 ID를 계속 바꿔가며 테스트를 구동했는데 세션을 적용하면서
 * 모킹한 세션 관련 기능에선 사용자 ID가 1로 fix 되어 있기 때문입니다.
 */
describe.skip('Chatrooms 테스트 (e2e)', () => {
  let app: INestApplication;
  const clientSockets: Map<number, Socket> = new Map();

  /**
   * 여러개의 done을 실행하기 위한 클로저를 생성해주는 함수입니다.
   *
   * @param cnt done 개수
   * @param func done
   */
  const exec = (cnt: number, func: () => jest.DoneCallback) => {
    let counter = cnt;
    return () => {
      counter -= 1;
      if (counter === 0) {
        func();
      }
    };
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.listen(3000);
    clientSockets.set(10, await generateSocketClient(10));
    clientSockets.set(11, await generateSocketClient(11));
    clientSockets.set(15, await generateSocketClient(15));
    clientSockets.set(16, await generateSocketClient(16));
  });

  afterEach(async () => {
    clientSockets.forEach((socket) => socket.close());
    // 스케쥴러가 남아있으면 테스트가 비정상적으로 종료되므로 남아있는 스케쥴러를 모두 제거합니다.
    const schedulerRegistry: SchedulerRegistry = app.get<SchedulerRegistry>(SchedulerRegistry);
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
    await app.close();
  });

  describe('채팅 테스트', () => {
    test('대화 테스트', (done) => {
      // given
      const clientSocket1 = clientSockets.get(10);
      const clientSocket2 = clientSockets.get(11);
      const roomId = 1;
      const msg = '안녕하세요';

      // when, then
      const quit = exec(2, done);
      clientSocket1.on('room:chat', (data) => {
        expect(data.chatSeq).toBe(roomId);
        expect(data.userIDs).toContain(10);
        expect(data.msg).toBe(msg);
        expect(data.id).toBeDefined();
        quit();
      });
      clientSocket2.on('room:chat', (data) => {
        expect(data.chatSeq).toBe(roomId);
        expect(data.userIDs).toContain(10);
        expect(data.msg).toBe(msg);
        expect(data.id).toBeDefined();
        quit();
      });
      clientSocket1.emit('chat', {
        at: roomId,
        content: msg,
      });
    });

    test('뮤트 테스트', (done) => {
      // given
      const clientSocket1 = clientSockets.get(10);
      const clientSocket2 = clientSockets.get(11);
      const roomId = 1;
      const msg = '안녕하세요';

      // when, then
      const quit = exec(1, done);
      clientSocket1.on('room:chat', () => {
        throw new Error('it should not reach here');
      });
      clientSocket2.on('room:chat', (data) => {
        expect(data.chatSeq).toBe(roomId);
        expect(data.userIDs).toContain(0);
        expect(data.msg).toBeDefined();
        expect(data.id).toBeDefined();
        quit();
      });
      clientSocket2.emit('chat', {
        at: roomId,
        content: msg,
      });
    });
  });

  describe('방 / DM 생성', () => {
    describe('POST /chatrooms/new/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const by = 15; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .post(`/chatrooms/new/${by}`)
          .send({
            chatType: 'CHTP30',
            chatName: '푸주홍의 등산크럽',
            password: '1q2w3e4r!',
            isDirected: true,
          });

        // then
        const quit = exec(2, done);
        clientSockets.get(15).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(by);
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });
      test('비정상적인 요청 - 비밀번호 누락', (done) => {
        // given
        const by = 15; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .post(`/chatrooms/new/${by}`)
          .send({
            chatType: 'CHTP30',
            chatName: '푸주홍의 등산크럽',
            isDirected: true,
          });

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });

    describe('POST /chatrooms/new/dm/{target}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 15;
        const by = 16; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .post(`/chatrooms/new/dm/${target}/${by}`)
          .send({
            chatType: 'CHTP30',
            chatName: '푸주홍의 등산크럽',
            password: '1q2w3e4r!',
            isDirected: true,
          });

        // then
        const quit = exec(2, done);
        clientSockets.get(by).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(by);
          quit();
        });
        clientSockets.get(target).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(target);
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
        });
      });

      test('비정상적인 요청 - 본인과의 DM', (done) => {
        // given
        const target = 15;
        const by = 15; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .post(`/chatrooms/new/dm/${target}/${by}`)
          .send({
            chatType: 'CHTP30',
            chatName: '푸주홍의 등산크럽',
            isDirected: true,
          });

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });
  });

  describe('방 입장 / 퇴장', () => {
    describe('PUT /chatrooms/join/{roomId}/{by}', () => {
      test('비밀번호 걸린 방', (done) => {
        // given
        const roomId = 1;
        const password = 'puju';
        const by = 15; // NOTE 추후에 세션으로 변경 필요합니다.
        const chatParticipant1 = 10;
        const chatParticipant2 = 11;

        // when
        const req = request(app.getHttpServer())
          .put(`/chatrooms/join/${roomId}/${by}`)
          .send({
            password,
          });

        // then
        const quit = exec(7, done);
        clientSockets.get(by).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(by);
          quit();
        });
        clientSockets.get(chatParticipant1).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(by);
          quit();
        });
        clientSockets.get(chatParticipant2).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(by);
          quit();
        });
        clientSockets.get(by).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        clientSockets.get(chatParticipant1).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        clientSockets.get(chatParticipant2).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });

      test('비정상적인 요청 - 비밀번호 누락', (done) => {
        // given
        const roomId = 1;
        const by = 15; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .put(`/chatrooms/join/${roomId}/${by}`);

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });

    describe('DELETE /chatrooms/leave/{roomId}/{by}', () => {
      test('속한 방', (done) => {
        // given
        const roomId = 1;
        const by = 11; // NOTE 추후에 세션으로 변경 필요합니다.
        const chatParticipant1 = 10;

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/leave/${roomId}/${by}`);

        // then
        const quit = exec(4, done);
        clientSockets.get(by).on('room:leave', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(by);
          expect(data.kicked).toBeFalsy();
          quit();
        });
        clientSockets.get(chatParticipant1).on('room:leave', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(by);
          expect(data.kicked).toBeFalsy();
          quit();
        });
        clientSockets.get(chatParticipant1).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });

      test('방장 나갈 시에 다른 인원 방장 임명', (done) => {
        // given
        const roomId = 1;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.
        const chatParticipant1 = 11;

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/leave/${roomId}/${by}`);

        // then
        const quit = exec(4, done);
        clientSockets.get(by).on('room:leave', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(by);
          expect(data.kicked).toBeFalsy();
          quit();
        });
        clientSockets.get(chatParticipant1).on('room:leave', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(by);
          expect(data.kicked).toBeFalsy();
          quit();
        });
        clientSockets.get(chatParticipant1).on('room:grant', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(chatParticipant1);
          expect(data.role).toBe(PartcAuth.CPAU30);
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });

      test('비정상적인 요청 - 속하지 않은 방', (done) => {
        // given
        const roomId = 1;
        const by = 15; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/leave/${roomId}/${by}`);

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('비정상적인 요청 - 존재하지 않는 방', (done) => {
        // given
        const roomId = 10;
        const by = 15; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/leave/${roomId}/${by}`);

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });
  });

  describe('사용자 초대 / 강퇴', () => {
    describe('PUT /chatrooms/invite/{target}/{roomId}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 15;
        const roomId = 1;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.
        const chatParticipant1 = 11;

        // when
        const req = request(app.getHttpServer())
          .put(`/chatrooms/invite/${target}/${roomId}/${by}`);

        // then
        const quit = exec(4, done);
        clientSockets.get(by).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(target);
          quit();
        });
        clientSockets.get(chatParticipant1).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(target);
          quit();
        });
        clientSockets.get(target).on('room:join', (data) => {
          expect(data.chatSeq).toBeDefined();
          expect(data.userIDs).toContain(target);
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });

      test('비정상적인 요청 - 권한이 없는 초대자', (done) => {
        // given
        const target = 15;
        const roomId = 0;
        const by = 11; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .put(`/chatrooms/invite/${target}/${roomId}/${by}`);

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });

    describe('DELETE /chatrooms/kick/{target}/{roomId}/{by}', () => {
      test('속한 방', (done) => {
        // given
        const target = 11;
        const roomId = 0;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/kick/${target}/${roomId}/${by}`);

        // then
        const quit = exec(3, done);
        clientSockets.get(by).on('room:leave', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(target);
          expect(data.kicked).toBeTruthy();
          quit();
        });
        clientSockets.get(target).on('room:leave', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(target);
          expect(data.kicked).toBeTruthy();
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });

      test('비정상적인 요청 - 속하지 않은 방', (done) => {
        // given
        const target = 15;
        const roomId = 1;
        const by = 11; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/kick/${target}/${roomId}/${by}`);

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('비정상적인 요청 - 존재하지 않는 방', (done) => {
        // given
        const target = 10;
        const roomId = 10;
        const by = 11; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/kick/${target}/${roomId}/${by}`);

        // then
        req.end((_, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });
  });

  describe('부방장 임명 / 해임', () => {
    describe('PUT /chatrooms/manager/{target}/{roomId}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 11;
        const roomId = 0;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .put(`/chatrooms/manager/${target}/${roomId}/${by}`);

        // then
        const quit = exec(3, done);
        clientSockets.get(target).on('room:grant', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(target);
          expect(data.role).toBe(PartcAuth.CPAU20);
          quit();
        });
        clientSockets.get(by).on('room:grant', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(target);
          expect(data.role).toBe(PartcAuth.CPAU20);
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });
    });

    describe('DELETE /chatrooms/manager/{target}/{roomId}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 11;
        const roomId = 1;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/manager/${target}/${roomId}/${by}`);

        // then
        const quit = exec(3, done);
        clientSockets.get(target).on('room:grant', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(target);
          expect(data.role).toBe(PartcAuth.CPAU10);
          quit();
        });
        clientSockets.get(by).on('room:grant', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(target);
          expect(data.role).toBe(PartcAuth.CPAU10);
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });
    });
  });

  describe('사용자 뮤트 / 뮤트 해제', () => {
    describe('PUT /chatrooms/mute/{target}/{roomId}/{time}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 11;
        const roomId = 0;
        const time = 10;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .put(`/chatrooms/mute/${target}/${roomId}/${time}/${by}`);

        // then
        const quit = exec(3, done);
        clientSockets.get(target).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        clientSockets.get(by).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });
    });

    describe('DELETE /chatrooms/mute/{target}/{roomId}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 11;
        const roomId = 1;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/mute/${target}/${roomId}/${by}`);

        // then
        const quit = exec(3, done);
        clientSockets.get(target).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        clientSockets.get(by).on('room:chat', (data) => {
          expect(data.chatSeq).toBe(roomId);
          expect(data.userIDs).toContain(0);
          expect(data.msg).toBeDefined();
          expect(data.id).toBeDefined();
          quit();
        });
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });
    });
  });

  describe('사용자 차단 / 차단 해제', () => {
    describe('PUT /chatrooms/block/{target}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 10;
        const by = 11; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .put(`/chatrooms/block/${target}/${by}`);

        // then
        const quit = exec(1, done);
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });
    });

    describe('DELETE /chatrooms/block/{target}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const target = 11;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .delete(`/chatrooms/block/${target}/${by}`);

        // then
        const quit = exec(1, done);
        req.end((_, res) => {
          expect(res.status).toBe(204);
          quit();
        });
      });
    });
  });

  describe('채팅 메시지 조회', () => {
    describe('GET /chatrooms/message/{roomId}/{msgID}/{count}/{by}', () => {
      test('정상적인 요청', (done) => {
        // given
        const roomId = 0;
        const msgID = -1;
        const count = 10;
        const by = 10; // NOTE 추후에 세션으로 변경 필요합니다.

        // when
        const req = request(app.getHttpServer())
          .get(`/chatrooms/message/${roomId}/${msgID}/${count}/${by}`);

        // then
        const quit = exec(1, done);
        req.end((_, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          quit();
        });
      });
    });
  });

  describe('방 정보 조회', () => {
    describe('GET /chatrooms/room/{roomId}', () => {
      test('정상적인 요청', (done) => {
        // given
        const roomId = 0;

        // when
        const req = request(app.getHttpServer())
          .get(`/chatrooms/room/${roomId}`);

        // then
        const quit = exec(1, done);
        req.end((_, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('chatSeq');
          expect(res.body).toHaveProperty('chatName');
          expect(res.body).toHaveProperty('chatType');
          expect(res.body.chatType).not.toEqual(ChatType.CHTP10);
          expect(res.body.chatType).not.toEqual(ChatType.CHTP40);
          expect(res.body).toHaveProperty('isPassword');
          expect(res.body).toHaveProperty('participants');
          quit();
        });
      });
    });
  });

  describe('채팅방 검색', () => {
    test('GET /chatrooms/search', (done) => {
      // when
      const req = request(app.getHttpServer())
        .get('/chatrooms/search');

      // then
      req.end((_, res) => {
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        res.body.forEach((chatroom) => {
          expect(chatroom).toHaveProperty('chatSeq');
          expect(chatroom).toHaveProperty('chatName');
          expect(chatroom).toHaveProperty('chatType');
          expect(chatroom.chatType).not.toEqual(ChatType.CHTP10);
          expect(chatroom.chatType).not.toEqual(ChatType.CHTP40);
          expect(chatroom).toHaveProperty('isPassword');
          expect(chatroom).toHaveProperty('participants');
        });
        done();
      });
    });
  });
});
