import {
  Controller, Get, Logger, Param, Post, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { CheckLogin } from 'src/guards/check-login.guard';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/auth/user.decorator';
import { UserProfileService } from 'src/profile/user-profile.service';
import { UserService } from 'src/user/user.service';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlarmService } from 'src/alarm/alarm.service';
import { FriendsService } from './friends.service';
import { GetFriendsDto } from './dto/get-friends.dto';

@ApiTags('친구')
@Controller('/community/friends')
@UsePipes(new ValidationPipe({ transform: true }))
export class FriendsController {
  private readonly logger = new Logger(FriendsController.name);

  constructor(
    private readonly friendsService: FriendsService,
    private readonly userProfileService: UserProfileService,
    private readonly userService: UserService,
    private readonly eventEitter : EventEmitter2,
    private readonly alarmService: AlarmService,
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
  @Post('/request/:target')
  async requestFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    @Param('target') target: number,
  ) {
    this.logger.log(`친구 요청: ${user.userSeq} -> ${target}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    await this.friendsService.requestFriend(user.userSeq, target);
    await this.eventEitter.emit('alarm:confirm', user.userSeq, target, AlarmCode.ALAM20);
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
    name: 'target', type: Number, example: 1, description: '먼저 친구 요청을 보낸 유저',
  })
  @UseGuards(CheckLogin)
  @Post('/accept/:target')
  async acceptFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    @Param('target') target: number,
  ) {
    this.logger.log(`친구 요청 - 수락: ${user.userSeq} 가 ${target} 의 친구요정을 수락하였습니다.`);
    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    await this.friendsService.acceptFriend(user.userSeq, target);
    this.eventEitter.emit('friends:update', user.userSeq, target);
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
    name: 'target', type: Number, example: 1, description: '먼저 친구 요청을 보낸 유저',
  })
  @UseGuards(CheckLogin)
  @Post('/reject/:target')
  async rejectFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    @Param('target') target: number,
  ) {
    this.logger.log(`친구 요청 - 거절: ${user.userSeq} 가 ${target} 의 친구요청을 거절하였습니다.`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }
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
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '삭제 대상이 된 유저',
  })
  @UseGuards(CheckLogin)
  @Post('/delete/:target')
  async deleteFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    @Param('target') target: number,
  ) {
    this.logger.log(`친구 삭제: ${user.userSeq}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    await this.friendsService.removeFriend(user.userSeq, target);
    this.eventEitter.emit('friends:update', user.userSeq, target);
  }

  /**
   * 친구를 블락 합니다.
   *
   * @param target 블락할 유저
   */
  @ApiOperation({ summary: '블락 요청', description: '요청 상대를 블락합니다.' })
  @ApiResponse({ status: 200, description: '블락 요청 성공' })
  @ApiResponse({ status: 400, description: '블락 요청 실패' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '블락 대상 유저',
  })
  @UseGuards(CheckLogin)
  @Get('/block/:target')
  async blockFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    @Param('target') target: number,
  ) {
    this.logger.log(`블락 요청 : ${user.userSeq} -> ${target}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    await this.friendsService.blockFriend(user.userSeq, target);
  }

  /**
   * 블락된 친구를 해지 합니다.
   *
   * @param target 블락해지할 유저
   */
  @ApiOperation({ summary: '블락 해지 요청', description: '요청 상대를 블락 해지합니다.' })
  @ApiResponse({ status: 200, description: '블락 해지 요청 성공' })
  @ApiResponse({ status: 400, description: '블락 해지 요청 실패' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '블락 대상 유저',
  })
  @UseGuards(CheckLogin)
  @Get('/unblock/:target')
  async unblockFriend(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
    @Param('target') target: number,
  ) {
    this.logger.log(`블락 해지 요청 : ${user.userSeq} -> ${target}`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    await this.friendsService.unblockFriend(user.userSeq, target);
  }

  /**
   * 블란된 유저 리스트를 가져옵니다.
   */
  @ApiOperation({ summary: '유저 리스트 받아오기', description: '자신이 차단한 유저의 목록을 가져옵니다ㅑ.' })
  @ApiResponse({ status: 200, type: [Number], description: '차단 유저 리스트 가져오기 성공' })
  @ApiResponse({ status: 400, description: '차단 유저 리스트 가져오기 실패' })
  @UseGuards(CheckLogin)
  @Get('/blocklist')
  async getBlockList(
  @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ) {
    this.logger.log(`${user.userSeq} 의 블락 리스트를 가져옵니다.`);

    const check = await this.userProfileService.checkUser(user.userSeq);
    if (!check) {
      throw new Error('유저 정보가 존재하지 않습니다.');
    }

    const blockList = await this.friendsService.getBlockList(user.userSeq);
    this.eventEitter.emit('friends:update', user.userSeq);

    return blockList;
  }
}
