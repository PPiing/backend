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

  test('(임시 테스트) 쿠키-세션 유효성 확인', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/data')
      .set('Cookie', cookie);
    expect(response.statusCode).toBe(200);
  });

  describe.skip('유저 조회', () => {
    describe('/users/:user_seq/profile', () => {
      test('정상적인 요청', async () => {
        // given
        const userSeq = 1;

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/${userSeq}/profile`);

        // then
        expect(response.status).toBe(200);
        expect(response.body.user_info).toBeDefined();
        expect(response.body.user_info.user_name).toBeDefined();
        expect(response.body.user_info.user_email).toBeDefined();
        expect(response.body.user_info.user_status).toBeDefined();
        expect(response.body.user_info.user_image).toBeDefined();
        // expect(response.body.user_info.isFriend).toBeDefined();
        // expect(response.body.user_info.isBlock).toBeDefined();
        // NOTE: 다른 테이블과의 조인이 필요한 부분이므로 추후에 검증
      });

      test('비정상적인 요청 - 어드민 계정 조회', async () => {
        // given
        const userSeq = 0; // 어드민 계정 조회 요청

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/${userSeq}/profile`);

        // then
        expect(response.status).toBe(403); // 어드민 계정 조회 금지
      });

      test('비정상적인 요청 - 잘못된 인자', async () => {
        // given
        const userSeq = 'string'; // 문자열 들어가면 에러

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/${userSeq}/profile`);

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('/users/me/profile', () => {
      test('정상적인 요청', async () => {
        // given
        // NOTE: 세션 삽입
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .get('/users/me/profile')
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(200);
        expect(response.body.user_info).toBeDefined();
        expect(response.body.user_info.user_name).toBeDefined();
        expect(response.body.user_info.user_email).toBeDefined();
        expect(response.body.user_info.user_status).toBeDefined();
        expect(response.body.user_info.user_image).toBeDefined();
      });

      test('비정상적인 요청 - 잘못된 세션', async () => {
        // given
        // NOTE: 세션 삽입
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .get('/users/me/profile')
          .set('Cookie', userCookie);
          // TODO: 세션 정보 조회

        // then
        expect(response.status).toBe(400);
      });
    });
  });

  describe.skip('유저 정보 변경', () => {
    describe('/user/me/profile', () => {
      test('정상적인 요청', async () => {
        // given
        // NOTE: 세션 삽입
        const userCookie = cookie;

        // when
        const response = await request(app.getHttpServer())
          .patch('/users/me/profile')
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(200);
        expect(response.body.user_info).toBeDefined();
        expect(response.body.user_info.user_name).toBeDefined();
        expect(response.body.user_info.user_email).toBeDefined();
        expect(response.body.user_info.user_status).toBeDefined();
        expect(response.body.user_info.user_image).toBeDefined();
      });

      test('비정상적인 요청', async () => {
        // given
        const userCookie = cookie; // NOTE: 잘못된 쿠키

        // when
        const response = await request(app.getHttpServer())
          .patch('/users/me/profile')
          .set('Cookie', userCookie);

        // then
        expect(response.status).toBe(400);
      });
    });
  });
  // NOTE: 저장 동작은 API를 사용하지 않으므로 생략

  describe.skip('유저 정보 제거', () => {
    test('정상적인 요청', async () => {
      // given
      // NOTE: 세션 삽입
      const userCookie = cookie;

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/me/profile')
        .set('Cookie', userCookie);

      // then
      expect(response.status).toBe(200);
    });

    test('비정상적인 요청 - 어드민 계정 삭제', async () => {
      // given
      // NOTE: 세션 삽입
      const userCookie = cookie;

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/me/profile')
        .set('Cookie', userCookie);

      // then
      expect(response.status).toBe(403);
    });

    test('비정상적인 요청 - 세션 만료', async () => {
      // given
      // NOTE: 세션 삽입
      const userCookie = cookie;

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/me/profile')
        .set('Cookie', userCookie);

      // then
      expect(response.status).toBe(400);
    });
  });
});
