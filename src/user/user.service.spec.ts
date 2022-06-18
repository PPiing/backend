import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import MockUserRepository from './repository/mock/mock.user.repository';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';

const repositories = [
  {
    provide: getRepositoryToken(UserRepository),
    useClass: MockUserRepository,
  },
];

describe('UserService 테스트', () => {
  let userService: UserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        ...repositories,
      ],
    }).compile();

    userService = app.get<UserService>(UserService);
  });

  describe('findByUserId', () => {
    test('존재하는 유저 정보 조회', async () => {
      // given
      const userId = 1;

      // when
      const user = await userService.findByUserId(userId);

      // then
      expect(user).toBeDefined();
      expect(user.nickName).toBe('skim');
    });

    test('존재하지 않는 유저 정보 조회', async () => {
      // given
      const userId = 10;

      // when
      const user = await userService.findByUserId(userId);

      // then
      expect(user).toBeUndefined();
    });
  });

  describe('createByUserId', () => {
    test('존재하지 않는 유저 정보 생성', async () => {
      // given
      const authId = 123;
      const email = 'test@gmail.com';
      const name = 'puju';

      // when
      await userService.createByUserId(authId, email, name);
    });
  });

  describe('findByOAuthId', () => {
    test('존재하는 유저 정보 확인', async () => {
      // given
      const authId = 10;

      // when
      const result = await userService.findByOAuthId(authId);

      // then
      expect(result).toBeTruthy();
    });

    test('존재하지 않는 유저 정보 확인', async () => {
      // given
      const authId = 40;

      // when
      const result = await userService.findByOAuthId(authId);

      // then
      expect(result).toBeFalsy();
    });
  });
});
