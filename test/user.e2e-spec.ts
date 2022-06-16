import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import AppModule from 'src/app.module.e2e-spec';
import * as request from 'supertest';

describe('User E2E Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe.skip('유저 조회', () => {
    describe('/users/:user_seq/profile', () => {
      test('정상적인 요청', async () => {
        // given
        const user_seq = 1;

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/${user_seq}/profile`);

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
        const user_seq = 0; // 어드민 계정 조회 요청

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/${user_seq}/profile`);

        // then
        expect(response.status).toBe(403); // 어드민 계정 조회 금지
      });

      test('비정상적인 요청 - 잘못된 인자', async () => {
        // given
        const user_seq = 'string'; // 문자열 들어가면 에러

        // when
        const response = await request(app.getHttpServer())
          .get(`/users/${user_seq}/profile`);

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('/users/me/profile', () => {
      test('정상적인 요청', async () => {
        // given
        // TODO: 추후에 사용자에 대한 세션 쿠키를 삽입해야 함
        const user_cookie = 'user_cookie';

        // when
        const response = await request(app.getHttpServer())
          .get('/users/me/profile')
          .set('Cookie', `connect.sid=${user_cookie}`);

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
        // TODO: 추후에 사용자에 대한 세션 쿠키를 삽입해야 함
        const user_cookie = 'user_cookie';

        // when
        const response = await request(app.getHttpServer())
          .get('/users/me/profile')
          .set('Cookie', `connect.sid=${user_cookie}`);
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
        // TODO: 추후에 사용자에 대한 세션 쿠키를 삽입해야 함
        const user_cookie = 'user_cookie';

        // when
        const response = await request(app.getHttpServer())
          .patch('/users/me/profile')
          .set('Cookie', `connect.sid=${user_cookie}`);

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
        const user_cookie = 'user_cookie'; // NOTE: 잘못된 쿠키

        // when
        const response = await request(app.getHttpServer())
          .patch('/users/me/profile')
          .set('Cookie', `connect.sid=${user_cookie}`);

        // then
        expect(response.status).toBe(400);
      });
    });
  });
  // NOTE: 저장 동작은 API를 사용하지 않으므로 생략

  describe.skip('유저 정보 제거', () => {
    test('정상적인 요청', async () => {
      // given
      // TOD: 추후에 사용자에 대한 세션 쿠키를 삽입해야 함
      const user_cookie = 'user_cookie';

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/me/profile')
        .set('Cookie', `connect.sid=${user_cookie}`);
      // TODO: 추후에 세션 쿠키로 검증하도록 해야 함.

      // then
      expect(response.status).toBe(200);
    });

    test('비정상적인 요청 - 어드민 계정 삭제', async () => {
      // given
      // TOD: 추후에 사용자에 대한 세션 쿠키를 삽입해야 함
      const user_cookie = 'user_cookie';

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/me/profile')
        .set('Cookie', `connect.sid=${user_cookie}`);
      // TODO: 추후에 세션 쿠키로 검증하도록 해야 함.

      // then
      expect(response.status).toBe(403);
    });

    test('비정상적인 요청 - 세션 만료', async () => {
      // given
      // TOD: 추후에 사용자에 대한 세션 쿠키를 삽입해야 함
      const user_cookie = 'user_cookie';

      // when
      const response = await request(app.getHttpServer())
        .delete('/users/me}/profile')
        .set('Cookie', `connect.sid=${user_cookie}`);
      // TODO: 추후에 세션 쿠키로 검증하도록 해야 함.

      // then
      expect(response.status).toBe(400);
    });
  });
});
