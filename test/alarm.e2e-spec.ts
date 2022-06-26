import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Manager, Socket } from 'socket.io-client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as request from 'supertest';
import * as session from 'express-session';
import * as passport from 'passport';
import AlarmCode from '../src/enums/mastercode/alarm-code.enum';
import AppModule from '../src/app.module.e2e-spec';

async function generateSocketClient(id: number, connect = true): Promise<Socket> {
  const rtn = new Manager(
    'http://localhost:3001',
    {
      transports: ['websocket'],
    },
  ).socket('/alarm');
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

describe('Alarm 테스트 (e2e)', () => {
  let app: INestApplication;
  let eventRunner: EventEmitter2;
  let cookie: string;

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

    app.use(
      session({
        secret: 'secret key',
        resave: false,
        saveUninitialized: true,
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());
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

  describe.skip('eventRunner로 알람 생성', () => {
    const clientSockets: Map<number, Socket> = new Map();
    const client1 = 1;
    const client2 = 2;

    beforeEach(async () => {
      clientSockets.set(client1, await generateSocketClient(client1));
      clientSockets.set(client2, await generateSocketClient(client2));
    });

    afterEach(async () => {
      clientSockets.forEach((socket) => socket.close());
    });

    describe('일반 알람 생성', () => {
      test('서버 내부에서 방 초대 이벤트 발생 시에 소켓 전송 확인', (done) => {
        // given
        const receiverSeq = 1;
        const alarmCode = AlarmCode.ALAM12;

        // when
        eventRunner.emit('alarm:normal', receiverSeq, alarmCode);

        // then
        const quit = exec(1, done);
        const client1Socket = clientSockets.get(client1);
        client1Socket.on('alarm:normal', (alarm) => {
          expect(alarm.receiverSeq).toBe(receiverSeq);
          expect(alarm.alarmCode).toBe(alarmCode);
          expect(alarm.date).toBeDefined();
          quit();
        });
      });

      test('서버 내부에서 잘못된 요청을 발생시킬 때 소켓 전송이 되면 안됨', () => {
        // given
        const receiverSeq = 1;
        const alarmCode = AlarmCode.ALAM20; // 친구 요청

        // when
        eventRunner.emit('alarm:normal', receiverSeq, alarmCode);

        // then
        const client1Socket = clientSockets.get(client1);
        client1Socket.on('alarm:normal', () => {
          throw new Error('예상하지 못한 이벤트 발생');
        });
      });
    });

    describe('컨펌 알람 생성', () => {
      test('서버 내부에서 친구 요청 이벤트 발생 시에 소켓 전송 확인 후 accept 처리 확인', (done) => {
        // given
        const senderSeq = 2;
        const receiverSeq = 1;
        const alarmCode = AlarmCode.ALAM20;
        const acceptLink = 'http://localhost:3001/alarm/accept';
        const rejectLink = 'http://localhost:3001/alarm/reject';

        // when
        eventRunner.emit('alarm:confirm', senderSeq, receiverSeq, alarmCode, acceptLink, rejectLink);

        // then
        const quit = exec(1, done);
        const client1Socket = clientSockets.get(client1);
        client1Socket.on('alarm:confirm', (data) => {
          expect(data.acceptLink).toBe(acceptLink);
          quit();
        });
      });
    });
  });

  describe('알람 조회', () => {
    test('특정 유저가 수신한 읽지 않은 알람 조회', async () => {
      // given
      const userCookie = cookie;

      // when
      const res = await request(app.getHttpServer())
        .get('/alarm/alarms')
        .set('Cookie', userCookie);

      // then
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
      res.body.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });

    test('특정 유저가 수신한 모든 알람 조회', async () => {
      // given
      const userCookie = cookie;

      // when
      const res = await request(app.getHttpServer())
        .get('/alarm/alarms/all')
        .set('Cookie', userCookie);

      // then
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
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
