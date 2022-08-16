import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GetFriendsDto } from 'src/community-bar/friends/dto/get-friends.dto';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 유저 ID (유저 테이블의 PK)로 유저 정보를 가져옵니다.
   * 유저 정보가 없다면 undefined를 반환합니다.
   *
   * @param userId 유저 ID (PK)
   * @returns 유저 DTO
   */
  async findByUserId(userId: number): Promise<UserDto | undefined> {
    this.logger.debug(`UserService.findByUserId: ${userId}`);

    const user = await this.userRepository.findOne(userId);
    if (user) {
      const userDto: UserDto = {
        userSeq: user.userSeq,
        userId: user.userId,
        nickName: user.nickName,
        email: user.email,
        secAuthStatus: user.secAuthStatus,
        avatarImgUri: user.avatarImgUri,
        status: user.status,
        deleteStatus: user.deleteStatus,
        createdAt: user.createdAt,
        isLogin: 'N',
        firstLogin: false,
      };
      return userDto;
    }
    return undefined;
  }

  /**
   * OAuth를 통해 받은 유저 ID와 이메일, 이름을 이용해 신규 계정을 만듭니다. 계정이 이미 존재한다면 아무 동작도 하지 않습니다.
   *
   * @param userId OAuth를 통해 받은 유저 ID
   * @param email 유저 이메일
   * @returns 저장 여부
   */
  async createByUserId(userId: number, email: string, name: string): Promise<void> {
    this.logger.debug(`UserService.createByUserId: ${userId} ${email} ${name}`);
    if (!await this.userRepository.findByOAuthId(userId)) {
      await this.userRepository.createUser(userId, email, name);
    }
  }

  /**
   * OAuth를 통해 받은 유저 ID와 이메일, 이름을 이용해 신규 계정을 만듭니다. 계정이 이미 존재한다면 아무 동작도 하지 않습니다.
   *
   * @param userId OAuth를 통해 받은 유저 ID
   * @param email 유저 이메일
   * @returns 저장 여부
   */
  async findOrCreateByUserId(userId: number, email: string, name: string): Promise<UserDto> {
    let userInstance = await this.userRepository.findByOAuthId(userId);
    let firstLogin = false;
    let isLogin = 'N';
    if (userInstance === undefined) {
      userInstance = await this.userRepository.createUser(userId, email, name);
      firstLogin = true;
    }
    if (userInstance.secAuthStatus === false) {
      isLogin = 'Y';
    }
    return {
      userSeq: userInstance.userSeq,
      userId: userInstance.userId,
      nickName: userInstance.nickName,
      email: userInstance.email,
      secAuthStatus: userInstance.secAuthStatus,
      avatarImgUri: userInstance.avatarImgUri,
      status: userInstance.status,
      deleteStatus: userInstance.deleteStatus,
      createdAt: userInstance.createdAt,
      isLogin,
      firstLogin,
    };
  }

  /**
   * OAuth ID가 기존에 존재하는지 확인합니다. 존재할 경우 유저 고유 ID를 반환합니다.
   *
   * @param userId OAuth ID
   * @returns 존재 여부
   */
  async findByOAuthId(userId:number): Promise<number | undefined> {
    const user = await this.userRepository.findByOAuthId(userId);
    if (user) {
      return user.userSeq;
    }
    return undefined;
  }

  async findUserByOAuthId(userId:number): Promise<UserDto | undefined> {
    const user = await this.userRepository.findByOAuthId(userId);
    if (user) {
      return {
        userSeq: user.userSeq,
        userId: user.userId,
        nickName: user.nickName,
        email: user.email,
        secAuthStatus: user.secAuthStatus,
        avatarImgUri: user.avatarImgUri,
        status: user.status,
        deleteStatus: user.deleteStatus,
        createdAt: user.createdAt,
        isLogin: 'N',
        firstLogin: false,
      };
    }
    return undefined;
  }

  /**
   * 유저 ID를 arrary로 주어졌을 때 유저 정보 리스트를 가져옵니다.
   *
   * @param userIds 유저 ID 배열
   * @returns 유저 정보 리스트
   */
  async getFriendsInfo(userIds: number[]): Promise<GetFriendsDto[]> {
    this.logger.debug(`UserService.getFriendsInfo: ${userIds}`);

    const users = await this.userRepository.getFriendsInfo(userIds);
    return users;
  }

  /**
   * nickname 으로 유저를 검색합니다.
   *
   * @param nickName 유저 닉네임
   * @return 유저 정보
   */
  async findByNickname(nickName: string): Promise<UserDto> {
    this.logger.debug(`findByNickname: ${nickName}`);
    const user = await this.userRepository.findByNickname(nickName);

    if (user === undefined) {
      throw new BadRequestException('잘못된 닉네임 입니다.');
    }
    return user;
  }
}
