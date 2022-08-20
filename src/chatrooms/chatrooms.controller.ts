import {
  BadRequestException,
  UsePipes, ParseIntPipe, ValidationPipe,
  Param, Body, Controller, HttpCode,
  Delete, Get, Post, Put,
  Logger,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiTags, ApiResponse, ApiOperation, ApiParam,
} from '@nestjs/swagger';
import { User } from 'src/auth/user.decorator';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import { CheckLogin } from 'src/guards/check-login.guard';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import ChatroomsService from './chatrooms.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('채팅방')
@Controller('chatrooms')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(CheckLogin)
export default class ChatroomsController {
  private readonly logger = new Logger(ChatroomsController.name);

  constructor(
    private chatroomsService: ChatroomsService,
    private userService: UserService,
    private eventRunner: EventEmitter2,
  ) {}

  /**
   * 새 방을 만듭니다. 방에 참여하는 유저는 본인 스스로를 추가하며 방장으로 지정합니다.
   *
   * @param reqData 방 정보
   * @returns 생성된 방 정보
   */
  @ApiOperation({ summary: '방 생성', description: '방을 만듭니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 생성 성공' })
  @ApiResponse({ status: 400, description: 'Field Error' })
  @Post('new')
  @HttpCode(204)
  async addRoom(
    @Body() reqData: ChatRequestDto,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`addRoom: ${reqData.chatName}`);
    await this.chatroomsService.checkUsers([userSeq]);
    const roomno = await this.chatroomsService.addRoom(reqData);
    await this.chatroomsService.addOwner(roomno, userSeq);
    this.eventRunner.emit('room:join', roomno, [userSeq]);
  }

  /**
   * 새 디엠 방을 만듭니다. 방에 참여하는 유저와 초대하고자 하는 유저를 추가합니다.
   *
   * @param target 디엠 보낼 사람
   * @returns 방 정보
   */
  @ApiOperation({ summary: '디엠 방 생성', description: '디엠 방을 만듭니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 생성 성공' })
  @ApiResponse({ status: 400, description: 'Body Field Error' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '초대받는 유저 ID',
  })
  @Post('new/dm/:target')
  @HttpCode(204)
  async addDM(
    @Param('target', ParseIntPipe) target: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`addDM: ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    if (target === userSeq) {
      throw new BadRequestException('자신과의 DM방을 만들 수 없습니다.');
    }
    const roomno = await this.chatroomsService.addDM(target, userSeq);
    await this.chatroomsService.addNormalUsers(roomno, [target, userSeq]);
    this.eventRunner.emit('room:join', roomno, [target, userSeq]);
  }

  /**
   * 사용자의 방 입장 요청을 처리합니다.
   *
   * @param roomId 방 ID
   * @param data POST data
   * @returns 조인 여부와 방 ID를 반환합니다.
   */
  @ApiOperation({ summary: '방 입장', description: '사용자가 방에 입장하려고 합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 참여 성공' })
  @ApiResponse({ status: 400, description: '비밀번호가 틀렸거나 존재하지 않는 방' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '입장하고자 하는 방 ID',
  })
  @Put('join/:roomId')
  @HttpCode(204)
  async joinRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
      @Body() data: JoinRoomDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`joinRoom: body -> ${JSON.stringify(data)}`);
    await this.chatroomsService.checkUsers([userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    const roomType = await this.chatroomsService.getRoomType(roomId);
    if (roomType === ChatType.CHTP10) {
      throw new BadRequestException('디엠엔 입장할 수 없습니다.');
    }
    const banned = await this.chatroomsService.isBanned(roomId, userSeq);
    if (banned) {
      throw new BadRequestException('방에서 추방되었습니다.');
    }
    const result = await this.chatroomsService.joinRoomByExUser(roomId, userSeq, data.password);
    if (result === false) {
      throw new BadRequestException('비밀번호가 틀렸습니다.');
    }
    this.chatroomsService.userInSave(roomId, userSeq);
    this.eventRunner.emit('room:join', roomId, [userSeq]);
    this.eventRunner.emit('room:notify', roomId, `${userSeq} 님이 입장했습니다.`);
  }

  /**
   * 특정 방에서 나가기 요청을 처리합니다.
   *
   * @param roomId 방 ID
   */
  @ApiOperation({ summary: '방 퇴장', description: '사용자가 방에서 나가려고 합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 나가기 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @Delete('leave/:roomId')
  @HttpCode(204)
  async leaveRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`leaveRoom: ${roomId} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    const isMaster = await this.chatroomsService.isMaster(roomId, userSeq);
    const result = await this.chatroomsService.leftUser(roomId, userSeq);
    if (!result) {
      throw new BadRequestException('방에 존재하지 않는 유저입니다.');
    }
    this.chatroomsService.userOutSave(roomId, userSeq);
    this.eventRunner.emit('room:leave', roomId, userSeq, false);
    this.eventRunner.emit('room:notify', roomId, `${userSeq} 님이 방을 나갔습니다.`);
    const peoples = await this.chatroomsService.getRoomParticipantsCount(roomId);
    if (peoples === 0) {
      await this.chatroomsService.deleteRoom(roomId);
    } else if (isMaster) {
      const nextAdmin = await this.chatroomsService.getNextAdmin(roomId);
      await this.chatroomsService.setAdmin(roomId, nextAdmin);
      this.eventRunner.emit('room:notify', roomId, `방장이 나가 ${nextAdmin} 님이 방장이 되었습니다.`);
      this.eventRunner.emit('room:grant', roomId, nextAdmin, PartcAuth.CPAU30);
    }
  }

  /**
   * 특정 사용자를 방에 초대합니다.
   * 초대하는 사용자가 권한이 없거나 자기 자신을 초대하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추
   * @param target 초대할 사용자 ID
   * @param roomId 초대할 방 ID
   */
  @ApiOperation({ summary: '사용자 초대', description: '사용자를 방에 초대합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '초대 성공' })
  @ApiResponse({ status: 400, description: '초대할 사용자가 존재하지 않거나 자신을 초대하거나 존재하지 않는 방' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '초대할 사용자 ID',
  })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '초대할 방 ID',
  })
  @Put('invite/:target/:roomId')
  @HttpCode(204)
  async inviteUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`inviteUser: ${target} -> ${roomId} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    const roomType = await this.chatroomsService.getRoomType(roomId);
    if (roomType === ChatType.CHTP10) {
      throw new BadRequestException('디엠엔 입장할 수 없습니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, userSeq) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === userSeq) {
      throw new BadRequestException('자신을 초대할 수 없습니다.');
    }
    const banned = await this.chatroomsService.isBanned(roomId, target);
    if (banned) {
      throw new BadRequestException('차단된 유저는 초대할 수 없습니다. 먼저 차단을 풀어주세요.');
    }
    await this.chatroomsService.addNormalUsers(roomId, [target]);
    this.chatroomsService.userInSave(roomId, target);
    this.eventRunner.emit('room:join', roomId, [target]);
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 초대되었습니다.`);
  }

  /**
   * 특정 사용자를 방에서 강퇴합니다.
   * 강퇴하는 사용자가 권한이 없거나 자기 자신을 강퇴하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추
   * @param target 강퇴할 사용자 ID
   * @param roomId 강퇴할 방 ID
   */
  @ApiOperation({ summary: '사용자 강퇴', description: '사용자를 방에서 강퇴합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '강퇴 성공' })
  @ApiResponse({ status: 400, description: '강퇴할 사용자가 존재하지 않거나 자신을 강퇴하거나 존재하지 않는 방' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '강퇴할 사용자 ID',
  })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '강퇴할 방 ID',
  })
  @Delete('kick/:target/:roomId')
  @HttpCode(204)
  async kickUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`kickUser: ${target} -> ${roomId} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isNormalUser(roomId, userSeq) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, target) === false) {
      throw new BadRequestException('같은 관리자는 강퇴할 수 없습니다.');
    }
    if (target === userSeq) {
      throw new BadRequestException('자신을 강퇴할 수 없습니다.');
    }
    await this.chatroomsService.leftUser(roomId, target);
    await this.chatroomsService.kickUserSave(roomId, target, userSeq);
    this.eventRunner.emit('room:leave', roomId, target, true);
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 강퇴당했습니다.`);
  }

  /**
   * 방 유저를 부방장에 임명합니다. 방장만이 실행할 수 있습니다.
   * 추
   * @param roomId 방 ID
   * @param target 유저 ID
   */
  @ApiOperation({
    summary: '부방장 임명',
    description: '방장이 일반 유저에 대해 부방장으로 임명합니다.',
  })
  @ApiResponse({ status: 204, description: '직책 변경 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '유저 ID',
  })
  @Put('manager/:target/:roomId')
  @HttpCode(204)
  async setManager(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, userSeq) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, target) === true) {
      await this.chatroomsService.setManager(roomId, target);
      this.eventRunner.emit('room:notify', roomId, `${target} 님이 매니저가 되었습니다.`);
      this.eventRunner.emit('room:grant', roomId, target, PartcAuth.CPAU20);
    }
  }

  /**
   * 방 유저를 부방장에서 해임합니다. 방장만이 실행할 수 있습니다.
   * 추
   * @param roomId 방 ID
   * @param target 유저 ID
   */
  @ApiOperation({
    summary: '부방장 해임',
    description: '방장이 방 유저를 부방장에서 해임합니다.',
  })
  @ApiResponse({ status: 204, description: '직책 변경 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '유저 ID',
  })
  @Delete('manager/:target/:roomId')
  @HttpCode(204)
  async unsetManager(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, userSeq) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (await this.chatroomsService.isManager(roomId, target) === true) {
      await this.chatroomsService.setNormalUser(roomId, target);
      this.eventRunner.emit('room:notify', roomId, `${target} 님이 매니저에서 해임되었습니다.`);
      this.eventRunner.emit('room:grant', roomId, target, PartcAuth.CPAU10);
    }
  }

  /**
   * 특정 사용자를 방에서 밴하고 입장을 막습니다.
   * 밴하는 사용자가 권한이 없거나 자기 자신을 밴하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추
   * @param target 밴할 사용자 ID
   * @param roomId 밴할 방 ID
   */
  @ApiOperation({ summary: '사용자 밴', description: '사용자를 방에서 밴 (강퇴 및 재입장 불가)합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '밴 성공' })
  @ApiResponse({ status: 400, description: '밴할 사용자가 존재하지 않거나 자신을 밴하거나 존재하지 않는 방' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '밴할 사용자 ID',
  })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '밴할 방 ID',
  })
  @Put('ban/:target/:roomId')
  @HttpCode(204)
  async banUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`banUser: ${target} -> ${roomId} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, userSeq) === false
       && await this.chatroomsService.isManager(roomId, userSeq) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === userSeq) {
      throw new BadRequestException('자신을 밴할 수 없습니다.');
    }
    await this.chatroomsService.banUser(roomId, target, userSeq);
    this.eventRunner.emit('room:leave', roomId, [target], true);
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 밴당했습니다.`);
  }

  /**
   * 특정 방에 벤당한 유저 리스트를 불러옵니다.
   *
   * @param roomId 방 ID
   */
  @ApiOperation({ summary: '방에서 밴당한 사람 확인', description: '특정 방에 벤당한 유저 리스트를 불러옵니다.' })
  @ApiResponse({ status: 200, description: '밴 성공' })
  @ApiResponse({ status: 400, description: '존재하지 않는 방' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @Get('ban/:roomId')
  async bannedUserList(
    @Param('roomId', ParseIntPipe) roomId: number,
      @User() user: UserDto,
  ): Promise<number[]> {
    const { userSeq } = user;
    this.logger.debug(`bannedUserList: ${roomId}`);
    await this.chatroomsService.checkRooms([roomId]);
    return this.chatroomsService.bannedUserList(roomId);
  }

  /**
   * 밴된 사용자를 밴 해제합니다.
   * 밴 해제하는 사용자가 권한이 없거나 자기 자신을 밴 해제하거나 존재하지 않는 사용자면 에러가 발생합니다.
   *
   * @param target 밴 해제할 사용자 ID
   * @param roomId 밴 해제할 방 ID
   */
  @ApiOperation({ summary: '밴 해제', description: '밴된 사용자를 밴 해제합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '밴 해제 성공' })
  @ApiResponse({ status: 400, description: '밴 해제할 사용자가 존재하지 않거나 자신을 밴 해제하거나 존재하지 않는 방' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '밴 해제할 사용자 ID',
  })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '밴 해제할 방 ID',
  })
  @Delete('ban/:target/:roomId')
  @HttpCode(204)
  async unbanUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`unbanUser: ${target} -> ${roomId} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, userSeq) === false
      && await this.chatroomsService.isManager(roomId, userSeq) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === userSeq) {
      throw new BadRequestException('자신을 밴 해제할 수 없습니다.');
    }
    await this.chatroomsService.unbanUser(roomId, target);
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 밴 해제되었습니다.`);
  }

  /**
   * 특정 사용자를 뮤트시킵니다.
   * 뮤트하는 사용자가 권한이 없거나 자기 자신을 뮤트하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추
   * @param target 뮤트할 사용자 ID
   * @param roomId 뮤트할 방 ID
   */
  @ApiOperation({ summary: '사용자 뮤트', description: '사용자를 뮤트시킵니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '뮤트 성공' })
  @ApiResponse({ status: 400, description: '뮤트할 사용자가 존재하지 않거나 자신을 뮤트하거나 존재하지 않는 방' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '뮤트할 사용자 ID',
  })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '뮤트할 방 ID',
  })
  @ApiParam({
    name: 'time', type: Number, example: 60, description: '뮤트할 시간 (1초 ~ 86400초(24시간))',
  })
  @Put('mute/:target/:roomId/:time')
  @HttpCode(204)
  async muteUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @Param('time', ParseIntPipe) time: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`muteUser: ${target} -> ${roomId} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    if (time < 0 || time > (60 * 60 * 24)) {
      throw new BadRequestException('차단 시간은 0에서 24시간 사이의 초 단위의 숫자여야 합니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, userSeq) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, target) === false) {
      throw new BadRequestException('같은 관리자에게 뮤트할 수 없습니다.');
    }
    if (target === userSeq) {
      throw new BadRequestException('자신을 뮤트할 수 없습니다.');
    }
    await this.chatroomsService.muteUser(roomId, target, userSeq, time);
    // 뮤트 유저 캐시에 등록 필요하고 뮤트된 여부를 방 유저들에게 알려주어야 함.
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 뮤트되었습니다.`);
  }

  /**
   * 뮤트된 사용자를 해제합니다. 뮤트 해제에 성공하면 뮤트 유저 캐시에서 제거하고 뮤트 해제된 사실을 방 유저들에게 알려줍니다.
   * 뮤트되있지 않은 사용자에게 뮤트를 시도하거나 해제하는 사용자가 권한이 없거나 자기 자신을 해제하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추
   * @param target 뮤트 해제할 사용자 ID
   * @param roomId 뮤트 해제할 방 ID
   */
  @ApiOperation({ summary: '뮤트 해제', description: '뮤트된 사용자를 해제합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '뮤트 해제 성공' })
  @ApiResponse({ status: 400, description: '뮤트 해제할 사용자가 존재하지 않거나 자신을 해제하거나 존재하지 않는 방' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '뮤트 해제할 사용자 ID',
  })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '뮤트 해제할 방 ID',
  })
  @Delete('mute/:target/:roomId')
  @HttpCode(204)
  async unmuteUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`unmuteUser: ${target} -> ${roomId} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isNormalUser(roomId, userSeq) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === userSeq) {
      throw new BadRequestException('자신을 해제할 수 없습니다.');
    }
    const result = await this.chatroomsService.unmuteUser(roomId, target);
    if (result === false) {
      throw new BadRequestException('뮤트되어있지 않은 사용자입니다.');
    }
    // 뮤트 해제 유저 캐시에 등록 필요하고 뮤트된 여부를 방 유저들에게 알려주어야 함.
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 뮤트 해제되었습니다.`);
  }

  /**
   * 사용자를 차단합니다.
   * 차단하려는 사용자가 존재하지 않거나 자신을 차단하려는 경우 에러가 발생합니다.
   * 추
   * @param target 차단할 사용자 ID
   * @returns 차단 성공 여부
   */
  @ApiOperation({ summary: '사용자 차단', description: '사용자를 차단합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '차단 성공' })
  @ApiResponse({ status: 400, description: '차단할 사용자가 존재하지 않거나 자신을 차단하려는 경우 에러가 발생합니다.' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '차단할 사용자 ID',
  })
  @Put('block/:target')
  @HttpCode(204)
  async blockUser(
    @Param('target', ParseIntPipe) target: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`blockUser: ${target} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    if (target === userSeq) {
      throw new BadRequestException('자신을 차단할 수 없습니다.');
    }
    const result = await this.chatroomsService.blockUser(userSeq, target);
    if (result === false) {
      throw new BadRequestException('이미 차단된 사용자입니다.');
    }
  }

  /**
   * 차단한 사용자의 차단을 풉니다.
   * 차단되어 있지 않거나 차단을 풀려는 사용자가 존재하지 않거나 본인에 대해 수행할경우 에러가 발생합니다.
   * 추
   * @param target 차단을 푸려는 사용자 ID
   * @returns 차단 성공 여부
   */
  @ApiOperation({ summary: '사용자 차단 해제', description: '차단한 사용자의 차단을 풉니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '차단 해제 성공' })
  @ApiResponse({ status: 400, description: '차단되어 있지 않거나 차단을 풀려는 사용자가 존재하지 않거나 본인에 대해 수행할경우 에러가 발생합니다.' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '차단을 푸려는 사용자 ID',
  })
  @Delete('block/:target')
  @HttpCode(204)
  async unblockUser(
    @Param('target', ParseIntPipe) target: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<void> {
    const { userSeq } = user;
    this.logger.debug(`blockUser: ${target} -> ${userSeq}`);
    await this.chatroomsService.checkUsers([target, userSeq]);
    if (target === userSeq) {
      throw new BadRequestException('자신에 대해 차단 해제를 할 수 없습니다.');
    }
    const result = await this.chatroomsService.unblockUser(userSeq, target);
    if (result === false) {
      throw new BadRequestException('이미 차단해제된 사용자입니다.');
    }
  }

  /**
   * 채팅방 ID와 채팅 메시지의 고유 ID를 받아 이전 채팅을 가져옵니다.
   * 추
   * @param roomId 방 ID
   * @param msgID 채팅 메시지의 고유 ID
   * @returns 채팅 메시지를 반환합니다.
   */
  @ApiOperation({
    summary: '채팅 메시지 조회',
    description: '채팅 메시지 조회 기능입니다. 기준이 되는 메시지 (msgID) 이전의 채팅을 가져오며, msgID가 -1일시 가장 최신의 메시지부터 가져옵니다.',
  })
  @ApiResponse({ status: 200, type: [MessageResponseDto], description: '채팅 메시지 조회 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @ApiParam({
    name: 'msgID', type: Number, example: -1, description: '메시지 고유 ID',
  })
  @ApiParam({
    name: 'count', type: Number, example: 10, description: '가져올 메시지 개수',
  })
  @Get('message/:roomId/:msgID/:count')
  async getMessage(
    @Param('roomId', ParseIntPipe) roomId: number,
      @Param('msgID', ParseIntPipe) msgID: number,
      @Param('count', ParseIntPipe) count: number,
      @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<Array<MessageResponseDto>> {
    const { userSeq } = user;
    await this.chatroomsService.checkUsers([userSeq]);
    await this.chatroomsService.checkRooms([roomId]);
    const messages = await this.chatroomsService.getMessages(
      roomId,
      msgID,
      count,
      userSeq,
    );
    const userIdLists = [...new Set(messages.map((m) => m.userSeq))];
    const userLists = await Promise.all(userIdLists.map((id) => this.userService.findByUserId(id)));
    const maps = new Map();
    for (let index = 0; index < userLists.length; index += 1) {
      maps.set(userIdLists[index], userLists[index]);
    }
    return messages
      .sort((a, b) => (a.msgSeq < b.msgSeq ? 1 : -1))
      .map((message) => ({
        msgSeq: message.msgSeq,
        chatSeq: message.chatSeq,
        userSeq: message.userSeq,
        msg: message.msg,
        createAt: message.createAt,
        nickname: maps.get(message.userSeq) !== undefined ? maps.get(message.userSeq).nickName : 'SYSTEM',
      }));
  }

  /**
   * 방 정보를 가져옵니다.
   *
   * @param roomId 방 ID
   * @returns 방 정보를 반환합니다.
   */
  @ApiOperation({ summary: '방 정보 조회', description: '방 정보를 조회합니다.' })
  @ApiResponse({ status: 200, type: ChatResponseDto, description: '방 정보 조회 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @Get('room/:roomId')
  async getRoom(@Param('roomId', ParseIntPipe) roomId: number): Promise<ChatResponseDto> {
    await this.chatroomsService.checkRooms([roomId]);
    this.logger.debug(`getRoom: ${roomId}`);
    const room = await this.chatroomsService.getRoomInfo(Number(roomId));
    return room;
  }

  /**
   * 방 정보를 변경합니다.
   *
   * @param roomId 방 ID
   */
  @ApiOperation({ summary: '방 정보 변경', description: '방 정보를 변경합니다.' })
  @ApiResponse({ status: 200, description: '방 정보 변경 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @Patch('room/:roomId')
  async updateRoom(@Param('roomId') roomId: number, @Body() roomInfo: UpdateRoomDto) {
    this.logger.debug(`${roomId} 정보 변경`);
    await this.chatroomsService.checkRooms([roomId]);

    if (roomId !== roomInfo.chatSeq) {
      throw new BadRequestException('변경될 방의 정보가 유효하지 않습니다.');
    }

    await this.chatroomsService.updateRoom(roomId, roomInfo);
  }

  /**
   * 방을 둘러봅니다. DM과 비공개 방은 제외합니다.
   *
   * @returns 입장할 수 있는 방 목록을 반환합니다.
   */
  @ApiOperation({ summary: '방 둘러보기', description: 'DM과 비공개 방을 제외한 방들을 출력해 줍니다.' })
  @ApiResponse({ status: 200, type: [ChatResponseDto], description: '방 목록' })
  @Get('search')
  async searchChatroom(): Promise<Array<ChatResponseDto>> {
    const result = await this.chatroomsService.searchChatroom();
    return result;
  }
}
