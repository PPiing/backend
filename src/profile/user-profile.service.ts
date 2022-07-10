import { Injectable, Logger } from '@nestjs/common';
import { GetUserDto } from './dto/get-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileRepository } from './repository/user-profile.repository';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  /**
   * 사용자 정보 가져오기
   *
   * @param userSeq
   * @return 유저 정보 or undefined
   */
  async getUserInfo(userSeq: number): Promise<GetUserDto | undefined> {
    this.logger.log(`유저 정보 조회 요청: ${userSeq}`);
    return this.userProfileRepository.getUser(userSeq);
  }

  /**
   * 사용자 유효성 체크
   *
   * @param userSeq
   * @return True/False
   */
  async checkUser(userSeq: number): Promise<boolean> {
    this.logger.log(`유저 유효성 체크 요청: ${userSeq}`);
    const user:boolean = await this.userProfileRepository.checkUser(userSeq);
    return user;
  }

  /**
   * 사용자 정보 수정
   *
   * @param userSeq
   * @param userData 수정된 유저 정보
   * @return 수정된 유저 정보
   */
  async updateUser(userSeq: number, userData: UpdateUserDto): Promise<UpdateUserDto> {
    this.logger.log(`유저 정보 수정 요청: ${userSeq}`);
    const user:UpdateUserDto = await this.userProfileRepository.updateUser(userSeq, userData);
    return user;
  }

  /**
   * 사용자 정보 삭제
   *
   * @param userSeq
   */
  async deleteUser(userSeq: number) {
    this.logger.log(`유저 정보 삭제 요청: ${userSeq}`);
    await this.userProfileRepository.deleteUser(userSeq);
  }

  /**
   * 사용자 닉네임으로 사용자 검색
   *
   * @param keyword 키워드
   * @return 사용자 정보
   */
  async getUserByKeyword(keyword: string): Promise<Array<SearchUserDto>> {
    this.logger.log(`유저 닉네임 조회 요청: ${keyword}`);
    return this.userProfileRepository.searchUsersByKeyword(keyword);
  }
}
