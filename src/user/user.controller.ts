import {
  BadRequestException,
  Controller, Delete, Get, Logger, Param, Patch,
} from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileService } from './user-profile.service';

@ApiTags('유저')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userProfileService: UserProfileService,
  ) {}

  /**
   * 유저 정보를 조회합니다.
   *
   * @param userSeq 유저 시퀀스
   * @returns 유저 정보
   */
  @ApiOperation({ summary: '유저 정보 조회', description: '유저 정보를 조회합니다.' })
  @ApiResponse({ status: 200, type: GetUserDto, description: '유저 정보 조회 성공' })
  @ApiResponse({ status: 400, description: '유저 정보 조회 실패' })
  @ApiParam({
    name: 'user_seq', type: Number, example: 1, description: '유저 시퀀스',
  })
  @Get('/:user_seq/profile')
  async getUser(@Param('user_seq') userSeq: number): Promise<GetUserDto> {
    this.logger.log(`유저 정보 조회 요청: ${userSeq}`);
    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }
    const user = await this.userProfileService.getUserInfo(userSeq);
    return user;
  }

  /**
   * 나의 정보를 조회합니다.
   *
   * @returns 나의 정보
   */
  @ApiOperation({ summary: '나의 정보 조회', description: '나의 정보를 조회합니다.' })
  @ApiResponse({ status: 200, type: GetUserDto, description: '나의 정보 조회 성공' })
  @Get('/me/profile')
  async getMe(): Promise<GetUserDto> {
    // TODO: session ID를 조회아여 cache에서 userSeq를 가져온다.
    const userSeq = 1;
    this.logger.log(`나의 정보 조회 요청: ${userSeq}`);

    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }
    const user = await this.userProfileService.getUserInfo(userSeq);
    return user;
  }

  /**
   * 나의 정보를 변경합니다.
   *
   * @param userSeq 유저 시퀀스
   * @returns 수정된 유저 정보
   */
  @ApiOperation({ summary: '나의 정보 변경', description: '나의 정보를 변경합니다.' })
  @ApiResponse({ status: 200, type: GetUserDto, description: '나의 정보 변경 성공' })
  @ApiParam({
    name: 'userData', type: UpdateUserDto, example: 1, description: '유저 정보',
  })
  @Patch('/me/profile')
  async updateUser(userData: UpdateUserDto): Promise<GetUserDto> {
    // TODO: session ID를 조회아여 cache에서 userSeq를 가져온다.
    const userSeq = 1;
    this.logger.log(`나의 정보 수정 요청: ${userSeq}`);

    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }

    const user = await this.userProfileService.updateUser(userSeq, userData);
    return user;
  }

  /**
   * 유저 정보를 삭제합니다.
   *
   * @param userSeq 유저 시퀀스
   */
  @ApiOperation({ summary: '유저 정보 삭제', description: '유저 정보를 삭제합니다.' })
  @ApiResponse({ status: 200, type: GetUserDto, description: '유저 정보 삭제 성공' })
  @Delete('/me/profile')
  async deleteUser() {
    // TODO: session ID를 조회아여 cache에서 userSeq를 가져온다.
    const userSeq = 1;
    this.logger.log(`유저 정보 삭제 요청: ${userSeq}`);

    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }

    await this.userProfileService.deleteUser(userSeq);
  }
}
