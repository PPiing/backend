import { HttpException, INestApplication } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import AppModule from 'src/app.module.e2e-spec';
import { FtGuard } from 'src/auth/guards/ft.guard';
import * as session from 'express-session';
import * as request from 'supertest';

describe('Friends E2E Test', () => {
  let app: INestApplication;
  let cookie: string;
  const user = 1; // NOTE: 사용자 아이디

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // AuthGuard (로그인 확인) Mock 생성
      .overrideGuard(AuthGuard).useValue({
        canActivate: (context: any) => {
          if (context.switchToHttp().getRequest().session.user) {
            return true;
          }
          throw new HttpException('로그인이 필요합니다.', 401);
        },
      })
    // FtGuard (42-passport) Mock 생성
      .overrideGuard(FtGuard)
      .useValue({
        canActivate: (context: any) => {
          // FIXME: 세션의 어느 프로퍼티에 사용자 키 값을 저장하는지 현재는 알 수 없음
          context.switchToHttp().getRequest().session.user = user;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.use(
      session({
        secret: 'secret key',
        resave: false,
        saveUninitialized: true,
      }),
    );

    await app.init();

    // 세션을 설정하고 쿠키를 받기 위한 로그인 요청
    const response = await request(app.getHttpServer())
      .get('/auth/42');
    cookie = response.headers['set-cookie'];
  });

  afterEach(async () => {
    await app.close();
  });

  describe.skip('친구 목록 조회하기', () => {
    describe('/community/friends', () => {
      test('정상적인 요청', async () => {
        // given
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .get('/community/friends')
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(200);
        expect(response.body.friends).toBeDefined();
        expect(response.body.friends.userSeq).toBeDefined();
        expect(response.body.friends.nickName).toBeDefined();
        expect(response.body.friends.avatarImgUri).toBeDefined();
        expect(response.body.friends.status).toBeDefined();
      });

      test('비정상적인 요청 - 잘못된 세션', async () => {
        // given
        // TODO: 잘못된 세션을 전달해야 한다.
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .get('/community/friends')
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(401);
      });
    });
  });

  describe.skip('친구 추가하기', () => {
    describe('/community/friends/add', () => {
      test('정상적인 요청', async () => {
        // given
        const userCookie = cookie;
        const targetFriends = {
          target: 2,
        };

        // when
        const response = await request(app.getHttpServer())
          .post('/community/friends/add')
          .send(targetFriends)
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(200);
      });

      test('비정상적인 요청 - 잘못된 세션', async () => {
        // given
        // TODO: 잘못된 세션을 전달해야 한다.
        const userCookie = cookie;
        const targetFriends = {
          target: 2,
        };

        // when
        const response = await request(app.getHttpServer())
          .post('/community/friends/add')
          .send(targetFriends)
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(401);
      });

      test('비정상적인 요청 - 잘못된 요청', async () => {
        // given
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .post('/community/friends/add')
          .send({})
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(400);
      });
    });
  });

  describe.skip('친구 삭제하기', () => {
    describe('/community/friends/delete', () => {
      test('정상적인 요청', async () => {
        // given
        const userCookie = cookie;
        const targetFriends = {
          target: 2,
        };

        // when
        const response = await request(app.getHttpServer())
          .post('/community/friends/delete')
          .send(targetFriends)
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(200);
      });

      test('비정상적인 요청 - 잘못된 세션', async () => {
        // given
        // TODO: 잘못된 세션을 전달해야 한다.
        const userCookie = cookie;
        const targetFriends = {
          target: 2,
        };

        // when
        const response = await request(app.getHttpServer())
          .post('/community/friends/add')
          .send(targetFriends)
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(401);
      });

      test('비정상적인 요청 - 잘못된 요청', async () => {
        // given
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .post('/community/friends/add')
          .send({})
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(400);
      });
    });
  });
});
