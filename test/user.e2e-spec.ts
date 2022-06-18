import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import AppModule from 'src/app.module.e2e-spec';
import * as session from 'express-session';
import * as request from 'supertest';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FtGuard } from 'src/auth/guards/ft.guard';

describe('User E2E Test', () => {
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
          if (context.switchToHttp().getRequest().session.passport.user.seq) {
            return true;
          }
          throw new HttpException('로그인이 필요합니다.', 401);
        },
      })
    // FtGuard (42-passport) Mock 생성
      .overrideGuard(FtGuard)
      .useValue({
        canActivate: (context: any) => {
          const o = {
            user: {
              seq: user,
            },
          };
          context.switchToHttp().getRequest().session.passport = o;
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

  test('(임시 테스트) 쿠키-세션 유효성 확인', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/data')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
  });

  describe('유저 조회', () => {
    describe('/users/profile/:user_seq', () => {
      test('정상적인 요청', async () => {
        // given
        const userSeq = 1;

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/profile/${userSeq}`);

        // then
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.userName).toBeDefined();
        expect(response.body.userEmail).toBeDefined();
        expect(response.body.userStatus).toBeDefined();
        expect(response.body.userImage).toBeDefined();
        // expect(response.body.isFriend).toBeDefined();
        // expect(response.body.isBlock).toBeDefined();
        // NOTE: 다른 테이블과의 조인이 필요한 부분이므로 추후에 검증
      });

      test('비정상적인 요청 - 어드민 계정 조회', async () => {
        // given
        const userSeq = 0; // 어드민 계정 조회 요청

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/profile/${userSeq}`);

        // then
        expect(response.status).toBe(403); // 어드민 계정 조회 금지
      });

      test('비정상적인 요청 - 잘못된 인자', async () => {
        // given
        const userSeq = 'string'; // 문자열 들어가면 에러

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/profile/${userSeq}`);

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('/users/profile', () => {
      test('정상적인 요청', async () => {
        // given
        // NOTE: 세션 삽입
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .get('/users/profile')
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.userName).toBeDefined();
        expect(response.body.userEmail).toBeDefined();
        expect(response.body.userStatus).toBeDefined();
        expect(response.body.userImage).toBeDefined();
      });

      test('비정상적인 요청 - 잘못된 세션', async () => {
        // given
        // NOTE: 세션 삽입
        const userCookie = 'string';

        // when
        const response = await request(app.getHttpServer())
          .get('/users/profile')
          .set('Cookie', userCookie);
          // TODO: 세션 정보 조회

        // then
        expect(response.status).toBe(400);
      });
    });
  });

  describe('유저 정보 변경', () => {
    describe('/users/profile', () => {
      test('정상적인 요청', async () => {
        // given
        // NOTE: 세션 삽입
        const userCookie = cookie;
        const newUserData = {
          nickName: 'new nickname',
          email: '123@gmail.com',
          secAuthStatus: false,
          avatarImgUri: './img/defaultProfile.jpg',
        };

        // when
        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .send(newUserData)
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.nickName).toEqual(newUserData.nickName);
        expect(response.body.email).toEqual(newUserData.email);
        expect(response.body.secAuthStatus).toEqual(newUserData.secAuthStatus);
        expect(response.body.avatarImgUri).toEqual(newUserData.avatarImgUri);
      });

      test('비정상적인 요청', async () => {
        // given
        const userCookie = 'expired';

        // when
        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(400);
      });
    });
  });
  // NOTE: 저장 동작은 API를 사용하지 않으므로 생략

  describe('유저 정보 제거', () => {
    test('정상적인 요청', async () => {
      // given
      // NOTE: 세션 삽입
      const userCookie = cookie;

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/profile')
        .set('Cookie', userCookie);

      // then
      expect(response.status).toBe(200);
    });

    test('비정상적인 요청 - 세션 만료', async () => {
      // given
      // NOTE: 세션 삽입
      const userCookie = 'expired';

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/profile')
        .set('Cookie', userCookie);

      // then
      expect(response.status).toBe(400);
    });
  });
});
