import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Manager, Socket } from 'socket.io-client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as request from 'supertest';
import AlarmCode from '../src/enums/mastercode/alarm-code.enum';
import AppModule from '../src/app.module.e2e-spec';

async function generateSocketClient(cookie: string, connect = true): Promise<Socket> {
  const rtn = new Manager(
    'http://localhost:3001',
    {
      transports: ['websocket'],
      extraHeaders: {
        Cookie: cookie,
      },
    },
  ).socket('/alarm');
  if (connect) {
    await new Promise<void>((resolve) => {
      rtn.on('connect', () => {
        resolve();
      });
      rtn.on('disconnect', () => {
        resolve();
      });
    });
  }
  return rtn;
}

describe('Alarm 테스트 (e2e)', () => {
  let app: INestApplication;
  let eventRunner: EventEmitter2;
  let cookie: string[];

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
    eventRunner = app.get<EventEmitter2>(EventEmitter2);

    await app.listen(3001);

    // 세션을 설정하고 쿠키를 받기 위한 로그인 요청
    const response = await request(app.getHttpServer())
      .get('/auth/login');
    cookie = response.headers['set-cookie'];
  });

  afterEach(async () => {
    await app.close();
  });

  describe('소켓 연결 테스트', () => {
    test('로그인 전 연결', async () => {
      const socket = await generateSocketClient('cookie');
      expect(socket.connected).toBe(false);
      socket.close();
    });

    test('로그인 후 연결', async () => {
      const socket = await generateSocketClient(cookie[0]);
      expect(socket.connected).toBe(true);
      socket.close();
    });
  });

  describe('eventRunner로 알람 생성', () => {
    const clientSockets: Map<number, Socket> = new Map();
    const client1 = 1;
    const client2 = 2;

    beforeEach(async () => {
      clientSockets.set(client1, await generateSocketClient(cookie[0]));
      clientSockets.set(client2, await generateSocketClient(cookie[0]));
    });

    afterEach(async () => {
      clientSockets.forEach((socket) => socket.close());
    });

    describe('일반 알람 생성', () => {
      test('서버 내부에서 방 초대 이벤트 발생 시에 소켓 전송 확인', (done) => {
        // given
        const receiverSeq = 1;
        const alarmCode = AlarmCode.ALAM12;
        const msg = '~~~ 방에 초대되었습니다.';

        // when
        eventRunner.emit('alarm:normal', receiverSeq, alarmCode, msg);

        // then
        const quit = exec(1, done);
        const client1Socket = clientSockets.get(client1);
        client1Socket.on('alarm:normal', (alarm) => {
          expect(alarm.alarmCode).toEqual(alarmCode);
          expect(alarm.message).toEqual(msg);
          quit();
        });
      });
    });

    describe('컨펌 알람 생성', () => {
      test('서버 내부에서 친구 요청 이벤트 발생 시에 소켓 전송 확인', (done) => {
        // NOTE: 컨펌 알람은 어떤 식으로 처리할지 추후에 재 논의. 일단 여기서 별도의 처리는 하지 않음.
        // given
        const senderSeq = 2;
        const receiverSeq = 1;
        const alarmCode = AlarmCode.ALAM20;

        // when
        eventRunner.emit('alarm:confirm', senderSeq, receiverSeq, alarmCode);

        // then
        const quit = exec(1, done);
        const client1Socket = clientSockets.get(client1);
        client1Socket.on('alarm:confirm', (alarm) => {
          expect(alarm.alarmCode).toEqual(alarmCode);
          expect(alarm.senderSeq).toEqual(senderSeq);
          quit();
        });
      });
    });
  });

  describe('알람 조회', () => {
    test('특정 유저가 수신한 읽지 않은 알람 조회 (일반 알람)', async () => {
      // given
      const userCookie = cookie;

      // when
      const res = await request(app.getHttpServer())
        .get('/alarm/alerts')
        .set('Cookie', userCookie);

      // then
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });

    test('특정 유저가 수신한 읽지 않은 알람 조회 (컨펌 알람)', async () => {
      // given
      const userCookie = cookie;

      // when
      const res = await request(app.getHttpServer())
        .get('/alarm/confirms')
        .set('Cookie', userCookie);

      // then
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      res.body.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });

    test('특정 유저가 수신한 모든 알람 조회 (일반 알람)', async () => {
      // given
      const userCookie = cookie;

      // when
      const res = await request(app.getHttpServer())
        .get('/alarm/alerts/all')
        .set('Cookie', userCookie);

      // then
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });

    test('특정 유저가 수신한 모든 알람 조회 (컨펌 알람)', async () => {
      // given
      const userCookie = cookie;

      // when
      const res = await request(app.getHttpServer())
        .get('/alarm/confirms/all')
        .set('Cookie', userCookie);

      // then
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      res.body.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });
  });

  describe('알람 읽음 / 제거', () => {
    test('알람 고유 ID를 이용한 읽음 처리', async () => {
      // given
      const id = 3;
      const userCookie = cookie;

      // when
      const res = await request(app.getHttpServer())
        .put(`/alarm/${id}`)
        .set('Cookie', userCookie);

      // then
      expect(res.status).toBe(204);
    });
  });

  test('알람 고유 ID를 이용한 제거', async () => {
    // given
    const id = 3;
    const userCookie = cookie;

    // when
    const res = await request(app.getHttpServer())
      .delete(`/alarm/${id}`)
      .set('Cookie', userCookie);

    // then
    expect(res.status).toBe(204);
  });
});
