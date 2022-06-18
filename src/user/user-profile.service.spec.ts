import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import MockUserProfileRepository from './repository/mock/mock.user-profile.repository';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserProfileService } from './user-profile.service';

const repositories = [
  {
    provide: getRepositoryToken(UserProfileRepository),
    useClass: MockUserProfileRepository,
  },
];

describe('UserProfileService 테스트', () => {
  let userProfileService: UserProfileService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        ...repositories,
      ],
    }).compile();

    userProfileService = app.get<UserProfileService>(UserProfileService);
  });

  describe('getUserInfo', () => {
    test('사용자 정보 가져오기', async () => {
      // given
      const userId = 1;

      // when
      const user = await userProfileService.getUserInfo(userId);

      // then
      expect(user).toBeDefined();
      expect(user.userName).toBe('skim');
    });

    test('존재하지 않는 사용자 정보 가져오기', async () => {
      // given
      const userId = 10;

      // when
      const user = await userProfileService.getUserInfo(userId);

      // then
      expect(user).toBeUndefined();
    });
  });

  describe('checkUser', () => {
    test('존재하는 유저 확인', async () => {
      // given
      const authId = 1;

      // when
      const result = await userProfileService.checkUser(authId);

      // then
      expect(result).toBeTruthy();
    });

    test('존재하지 않는 유저 확인', async () => {
      // given
      const authId = 40;

      // when
      const result = await userProfileService.checkUser(authId);

      // then
      expect(result).toBeFalsy();
    });
  });

  describe('updateUser', () => {
    test('사용자 정보 업데이트', async () => {
      // given
      const userId = 1;
      const data: UpdateUserDto = {
        nickName: 'puju',
        email: 'puju@42.fr',
        secAuthStatus: false,
        avatarImgUri: 'https://www.google.com/',
      };

      // when
      const result = await userProfileService.updateUser(userId, data);

      // then
      expect(result).toBeDefined();
    });
  });

  describe('deleteUser', () => {
    test('사용자 정보 삭제', async () => {
      // given
      const userId = 1;

      // when
      await userProfileService.deleteUser(userId);
    });
  });
});
