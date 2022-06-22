import {
  Controller, Get, Logger, Param, Post, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { CheckLogin } from 'src/guards/check-login.guard';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/auth/user.decorator';
import { UserProfileService } from 'src/user/user-profile.service';
import { UserService } from 'src/user/user.service';
import { GetFriendsDto } from './dto/get-friends.dto';
import { FriendsService } from './friends.service';

@ApiTags('친구')
@Controller('/community/friends')
@UsePipes(new ValidationPipe({ transform: true }))
export class FriendsController {
  private readonly logger = new Logger(FriendsController.name);

  constructor(
    private readonly friendsService: FriendsService,
    private readonly userProfileService: UserProfileService,
    private readonly userService: UserService,
  ) {}

  /**
   * 친구 목록 받아옵니다.
   *
   * @returns 친구 목록
   */
  @ApiOperation({ summary: '친구 목록 조회', description: '친구 목록을 조회합니다.' })
  @ApiResponse({ status: 200, type: [GetFriendsDto], description: '친구 목록 조회 성공' })
  @ApiResponse({ status: 400, description: '친구 목록 조회 실패' })
  @UseGuards(CheckLogin)
  @Get('/')
  async getFriends(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<GetFriendsDto[]> {
    this.logger.log(`친구 목록 조회: ${user.userSeq}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    const friendSeq: number[] = await this.friendsService.getFriends(user.userSeq);
    const friends: GetFriendsDto[] = await this.userService.getFriendsInfo(friendSeq);

    return friends;
  }

  /**
   * 친구 요청
   *
   * @param target 요청된 대상 유저
   */
  @ApiOperation({ summary: '친구 요청', description: '친구를 요청합니다.' })
  @ApiResponse({ status: 200, description: '친구 요청 성공' })
  @ApiResponse({ status: 400, description: '친구 요청 실패' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '친구 요청된 대상 유저',
  })
  @UseGuards(CheckLogin)
  @Post('/request')
  async requestFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    target: number,
  ) {
    this.logger.log(`친구 요청: ${user.userSeq} -> ${target}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    // TODO: alarm service에서 알람 생성 후 alarm_seq 를 받아와야 함
    // const alarm = await this.alarmService.requestFriends(user.userSeq, target);
    // TODO: 친구 요청 eventRunner 등록 (param : userSeq, target, alarmSeq)

    await this.friendsService.requestFriend(user.userSeq, target);
  }

  /**
   * 친구 요청  - 수락
   *
   * @param alarm_seq 알람 시퀀스
   * @param target 수락된 대상 유저
   */
  @ApiOperation({ summary: '친구 요청 - 수락', description: '친구 요청을 수락합니다.' })
  @ApiResponse({ status: 200, description: '친구 요청 수락 성공' })
  @ApiResponse({ status: 400, description: '친구 요청 수락 실패' })
  @ApiParam({
    name: 'alarm_seq', type: Number, example: 1, description: '알림 시퀀스',
  })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '수학된 대상 유저',
  })
  @UseGuards(CheckLogin)
  @Post('/accept:alarm_seq')
  async acceptFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    target: number,
    @Param('alarm_seq') alarm_seq: number,
  ) {
    this.logger.log(`친구 요청 - 수락: ${user.userSeq} -> ${target}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    // TODO: 친구 요청 수학 eventRunner 등록 (param : userSeq, target, alarmSeq)

    await this.friendsService.acceptFriend(user.userSeq, target);
  }

  /**
   * 친구 요청 - 거절
   *
   * @param alarm_seq 알람 시퀀스
   * @param target 거절된 대상 유저
   */
  @ApiOperation({ summary: '친구 요청 - 거절', description: '친구 요청을 거절합니다.' })
  @ApiResponse({ status: 200, description: '친구 요청 거절 성공' })
  @ApiResponse({ status: 400, description: '친구 요청 거절 실패' })
  @ApiParam({
    name: 'alarm_seq', type: Number, example: 1, description: '알림 시퀀스',
  })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '수학된 대상 유저',
  })
  @UseGuards(CheckLogin)
  @Post('/reject:alarm_seq')
  async rejectFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    target: number,
    @Param('alarm_seq') alarm_seq: number,
  ) {
    this.logger.log(`친구 요청 - 거절: ${user.userSeq} -> ${target}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    // TODO: 친구 요청 eventRunner 등록 (param : userSeq, target, alarmSeq)

    await this.friendsService.rejectFriend(user.userSeq, target);
  }

  /**
   * 친구를 삭제 합니다. (unfriends)
   *
   * @param target 삭제할 유저
   */
  @ApiOperation({ summary: '친구 삭제', description: '친구를 삭제합니다.' })
  @ApiResponse({ status: 200, description: '친구 삭제 성공' })
  @ApiResponse({ status: 400, description: '친구 삭제 실패' })

  @UseGuards(CheckLogin)
  @Post('/delete')
  async deleteFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    target: number,
  ) {
    this.logger.log(`친구 삭제: ${user.userSeq}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    // await this.friendsService.removeFriend(user.userSeq, target);
  }
}
