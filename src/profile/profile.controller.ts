import {
  BadRequestException, Body, Controller, Delete, ForbiddenException,
  Get, Logger, Param, Patch, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/auth/user.decorator';
import { CheckLogin } from 'src/guards/check-login.guard';
import { UserService } from 'src/user/user.service';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from '../user/dto/user.dto';
import { UserProfileService } from './user-profile.service';
import { GetProfileDto } from './dto/get-profile.dto';
import { UserAchivService } from './user-achiv.service';
import { UserGameService } from './user-game.service';
import { UserRankService } from './user-rank.service';

@ApiTags('유저')
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly userAchivService: UserAchivService,
    private readonly userGameService : UserGameService,
    private readonly userRankService : UserRankService,
    private readonly userService: UserService,
  ) {}

  /**
   * 유저 정보를 조회합니다.
   *
   * @param userSeq 유저 시퀀스
   * @returns 유저 정보
   */
  @ApiOperation({ summary: '유저 정보 조회', description: '유저 정보를 조회합니다.' })
  @ApiResponse({ status: 200, type: GetProfileDto, description: '유저 정보 조회 성공' })
  @ApiResponse({ status: 400, description: '유저 정보 조회 실패' })
  @ApiParam({
    name: 'user_seq', type: Number, example: 1, description: '유저 시퀀스',
  })
  @Get('/profile/:user_seq')
  async getUser(@Param('user_seq') userSeq: number): Promise<GetProfileDto> {
    this.logger.log(`유저 정보 조회 요청: ${userSeq}`);
    if (userSeq === 0) {
      throw new ForbiddenException('허가되지 않은 동작입니다.');
    }

    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }
    const user = await this.userProfileService.getUserInfo(userSeq);
    const achiv = await this.userAchivService.getUserAchiv(userSeq);
    const rank = await this.userRankService.getUserRank(userSeq);
    const game = await this.userGameService.geUserGame(userSeq);
    return ({
      user_info: user,
      achiv_info: achiv,
      rank_info: rank,
      game_log: game,
    });
  }

  /**
   * 나의 정보를 조회합니다.
   *
   * @returns 나의 정보
   */
  @ApiOperation({ summary: '나의 정보 조회', description: '나의 정보를 조회합니다.' })
  @ApiResponse({ status: 200, type: GetProfileDto, description: '나의 정보 조회 성공' })
  @UseGuards(CheckLogin)
  @Get('/profile')
  async getMe(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<GetProfileDto> {
    this.logger.log(`나의 정보 조회 요청: ${user.userSeq}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }

    const userInfo = await this.userProfileService.getUserInfo(user.userSeq);
    const achiv = await this.userAchivService.getUserAchiv(user.userSeq);
    const rank = await this.userRankService.getUserRank(user.userSeq);
    const game = await this.userGameService.geUserGame(user.userSeq);
    return ({
      user_info: userInfo,
      achiv_info: achiv,
      rank_info: rank,
      game_log: game,
    });
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
  @UseGuards(CheckLogin)
  @Patch('/profile')
  async updateUser(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
      @Body() userData: UpdateUserDto,
  ): Promise<UpdateUserDto> {
    const { userSeq } = user;
    this.logger.log(`나의 정보 수정 요청: ${userSeq}`);

    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }

    return this.userProfileService.updateUser(userSeq, userData);
  }

  /**
   * 나의 정보를 삭제합니다.
   *
   * @param userSeq 나의 시퀀스
   */
  @ApiOperation({ summary: '나의 정보 삭제', description: '나의 정보를 삭제합니다.' })
  @ApiResponse({ status: 200, type: GetUserDto, description: '나의 정보 삭제 성공' })
  @UseGuards(CheckLogin)
  @Delete('/profile')
  async deleteUser(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ) {
    const { userSeq } = user;
    this.logger.log(`유저 정보 삭제 요청: ${userSeq}`);

    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }

    await this.userProfileService.deleteUser(userSeq);
  }

  /**
   * 유저를 닉네임으로 검색합니다.
   *
   * @param nickname 닉네임
   */
  @ApiOperation({ summary: '닉네임 검색', description: '닉네임으로 유저를 검색합니다.' })
  @ApiResponse({ status: 200, type: GetProfileDto, description: '닉네임 검색 성공' })
  @Get('/search/:nickname')
  async searchUser(
    @Param('nickname') nickname: string,
  ): Promise<GetProfileDto> {
    this.logger.log(`닉네임 정보 조회 요청: ${nickname}`);

    const findUser = await this.userService.findByNickname(nickname);
    const { userSeq } = findUser;

    if (userSeq === 0) {
      throw new ForbiddenException('허가되지 않은 동작입니다.');
    }

    const check = await this.userProfileService.checkUser(userSeq);
    if (!check) {
      throw new BadRequestException('유저 정보가 존재하지 않습니다.');
    }
    const user = await this.userProfileService.getUserInfo(userSeq);
    const achiv = await this.userAchivService.getUserAchiv(userSeq);
    const rank = await this.userRankService.getUserRank(userSeq);
    const game = await this.userGameService.geUserGame(userSeq);
    return ({
      user_info: user,
      achiv_info: achiv,
      rank_info: rank,
      game_log: game,
    });
  }
}
