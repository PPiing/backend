import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import AppModule from 'src/app.module.e2e-spec';
import * as request from 'supertest';

describe('Friends E2E Test', () => {
  let app: INestApplication;
  let cookie: string;
  // const user = 1; // NOTE: 사용자 아이디

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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
