import { Injectable, Logger } from '@nestjs/common';
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
        secAuthStatus: user.secAuthStatuc,
        avatarImgUri: user.avatarImgUri,
        status: user.status,
        deleteStatus: user.deleteStatus,
        createdAt: user.createdAt,
      };
      return userDto;
    }
    return undefined;
  }

  /**
   * OAuth를 통해 받은 유저 ID와 이메일을 이용해 신규 계정을 만듭니다. 계정이 이미 존재한다면 아무 동작도 하지 않습니다.
   * NOTE 추후에 확장 가능성 있음
   *
   * @param userId OAuth를 통해 받은 유저 ID
   * @param email 유저 이메일
   * @returns 저장 여부
   */
  async createByUserId(userId: number, email: string): Promise<void> {
    this.logger.debug(`UserService.createByUserId: ${userId} ${email}`);
    if (!await this.userRepository.findByOAuthId(userId)) {
      await this.userRepository.createUser(userId, email);
    }
  }

  /**
   * OAuth ID가 기존에 존재하는지 확인합니다.
   *
   * @param userId OAuth ID
   * @returns 존재 여부
   */
  async findByOAuthId(userId:number): Promise<boolean> {
    const user = await this.userRepository.findByOAuthId(userId);
    return !!user;
  }
}
