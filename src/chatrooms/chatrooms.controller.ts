import {
  BadRequestException,
  UsePipes, ParseIntPipe, ValidationPipe,
  Param, Body, Controller, HttpCode,
  Delete, Get, Post, Put,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiTags, ApiResponse, ApiOperation, ApiParam,
} from '@nestjs/swagger';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import ChatroomsService from './chatrooms.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { MessageDataDto } from './dto/message-data.dto';

@ApiTags('채팅방')
@Controller('chatrooms')
@UsePipes(new ValidationPipe({ transform: true }))
export default class ChatroomsController {
  private readonly logger = new Logger(ChatroomsController.name);

  constructor(
    private chatroomsService: ChatroomsService,
    private eventRunner: EventEmitter2,
  ) {}

  /**
   * 새 방을 만듭니다. 방에 참여하는 유저는 본인 스스로를 추가하며 방장으로 지정합니다.
   * 추후에 본인 ID는 세션에서 가져올 예정입니다.
   *
   * @param reqData 방 정보
   * @param by 본인 유저 ID
   * @returns 생성된 방 정보
   */
  @ApiOperation({ summary: '방 생성', description: '방을 만듭니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 생성 성공' })
  @ApiResponse({ status: 400, description: 'Field Error' })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '유저 ID (제거 예정)',
  })
  @Post('new/:by')
  @HttpCode(204)
  async addRoom(
    @Body() reqData: ChatRequestDto,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`addRoom: ${reqData.chatName}`);
    await this.chatroomsService.checkUsers([by]);
    const roomno = await this.chatroomsService.addRoom(reqData);
    await this.chatroomsService.addOwner(roomno, by);
    this.eventRunner.emit('room:join', roomno, [by]);
  }

  /**
   * 새 디엠 방을 만듭니다. 방에 참여하는 유저와 초대하고자 하는 유저를 추가합니다.
   * 추후에 본인 ID는 세션에서 가져올 예정입니다.
   *
   * @param target 디엠 보낼 사람
   * @param by 본인 유저 ID
   * @returns 방 정보
   */
  @ApiOperation({ summary: '디엠 방 생성', description: '디엠 방을 만듭니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 생성 성공' })
  @ApiResponse({ status: 400, description: 'Body Field Error' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '초대받는 유저 ID',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '유저 ID (제거 예정)',
  })
  @Post('new/dm/:target/:by')
  @HttpCode(204)
  async addDM(
    @Param('target', ParseIntPipe) target: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`addDM: ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    const roomno = await this.chatroomsService.addDM(target, by);
    await this.chatroomsService.addNormalUsers(roomno, [target, by]);
    this.eventRunner.emit('room:join', roomno, [target, by]);
  }

  /**
   * 사용자의 방 입장 요청을 처리합니다.
   * 추후에 사용자 ID는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID
   * @param by 본인 유저 ID
   * @param data POST data
   * @returns 조인 여부와 방 ID를 반환합니다.
   */
  @ApiOperation({ summary: '방 입장', description: '사용자가 방에 입장하려고 합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 참여 성공' })
  @ApiResponse({ status: 400, description: '비밀번호가 틀렸거나 존재하지 않는 방' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '입장하고자 하는 방 ID',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '유저 ID (제거 예정)',
  })
  @Put('join/:roomId/:by')
  @HttpCode(204)
  async joinRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
      @Param('by', ParseIntPipe) by: number,
      @Body() data: JoinRoomDto,
  ): Promise<void> {
    this.logger.debug(`joinRoom: body -> ${JSON.stringify(data)}`);
    await this.chatroomsService.checkUsers([by]);
    await this.chatroomsService.checkRooms([roomId]);
    const roomType = await this.chatroomsService.getRoomType(roomId);
    if (roomType === ChatType.CHTP10) {
      throw new BadRequestException('디엠엔 입장할 수 없습니다.');
    }
    const banned = await this.chatroomsService.isBanned(roomId, by);
    if (banned) {
      throw new BadRequestException('방에서 추방되었습니다.');
    }
    const result = await this.chatroomsService.joinRoomByExUser(roomId, by, data.password);
    if (result === false) {
      throw new BadRequestException('비밀번호가 틀렸습니다.');
    }
    this.chatroomsService.userInSave(roomId, by);
    this.eventRunner.emit('room:join', roomId, [by]);
    this.eventRunner.emit('room:notify', roomId, `${by} 님이 입장했습니다.`);
  }

  /**
   * 특정 방에서 나가기 요청을 처리합니다.
   * 추후에 사용자 ID는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID
   * @param by 초대한 사용자 ID
   */
  @ApiOperation({ summary: '방 퇴장', description: '사용자가 방에서 나가려고 합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '방 나가기 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '유저 ID (제거 예정)',
  })
  @Delete('leave/:roomId/:by')
  @HttpCode(204)
  async leaveRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`leaveRoom: ${roomId} -> ${by}`);
    await this.chatroomsService.checkUsers([by]);
    await this.chatroomsService.checkRooms([roomId]);
    const isMaster = await this.chatroomsService.isMaster(roomId, by);
    const result = await this.chatroomsService.leftUser(roomId, by);
    if (result) {
      this.chatroomsService.userOutSave(roomId, by);
      this.eventRunner.emit('room:leave', roomId, by, false);
      this.eventRunner.emit('room:notify', roomId, `${by} 님이 방을 나갔습니다.`);
      const peoples = await this.chatroomsService.getRoomParticipantsCount(roomId);
      if (peoples === 0) {
        await this.chatroomsService.deleteRoom(roomId);
      } else if (isMaster) {
        const nextAdmin = await this.chatroomsService.getNextAdmin(roomId);
        await this.chatroomsService.addOwner(roomId, nextAdmin);
        this.eventRunner.emit('room:notify', roomId, `방장이 나가 ${nextAdmin} 님이 방장이 되었습니다.`);
        this.eventRunner.emit('room:grant', roomId, nextAdmin, PartcAuth.CPAU30);
      }
    }
  }

  /**
   * 특정 사용자를 방에 초대합니다.
   * 초대하는 사용자가 권한이 없거나 자기 자신을 초대하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 초대할 사용자 ID
   * @param roomId 초대할 방 ID
   * @param by 초대한 사용자 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '초대한 사용자 ID',
  })
  @Put('invite/:target/:roomId/:by')
  @HttpCode(204)
  async inviteUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`inviteUser: ${target} -> ${roomId} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    const roomType = await this.chatroomsService.getRoomType(roomId);
    if (roomType === ChatType.CHTP10) {
      throw new BadRequestException('디엠엔 입장할 수 없습니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, by) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === by) {
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
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 강퇴할 사용자 ID
   * @param roomId 강퇴할 방 ID
   * @param by 강퇴하는 관리자 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '강퇴하는 관리자 ID (제거 예정)',
  })
  @Delete('kick/:target/:roomId/:by')
  @HttpCode(204)
  async kickUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`kickUser: ${target} -> ${roomId} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isNormalUser(roomId, by) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, target) === false) {
      throw new BadRequestException('같은 관리자는 강퇴할 수 없습니다.');
    }
    if (target === by) {
      throw new BadRequestException('자신을 강퇴할 수 없습니다.');
    }
    await this.chatroomsService.leftUser(roomId, target);
    await this.chatroomsService.kickUserSave(roomId, target, by);
    this.eventRunner.emit('room:leave', roomId, [target], true);
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 강퇴당했습니다.`);
  }

  /**
   * 방 유저를 부방장에 임명합니다. 방장만이 실행할 수 있습니다.
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID
   * @param target 유저 ID
   * @param by 요청한 사람 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '요청한 사람의 ID (제거 예정)',
  })
  @Put('manager/:roomId/:target/:by')
  @HttpCode(204)
  async setManager(
    @Param('roomId', ParseIntPipe) roomId: number,
      @Param('target', ParseIntPipe) target: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, by) === false) {
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
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID
   * @param target 유저 ID
   * @param by 요청한 사람 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '요청한 사람의 ID (제거 예정)',
  })
  @Delete('manager/:roomId/:target/:by')
  @HttpCode(204)
  async unsetManager(
    @Param('roomId', ParseIntPipe) roomId: number,
      @Param('target', ParseIntPipe) target: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, by) === false) {
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
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 밴할 사용자 ID
   * @param roomId 밴할 방 ID
   * @param by 밴하는 관리자 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '밴하는 관리자 ID (제거 예정)',
  })
  @Put('ban/:target/:roomId/:by')
  @HttpCode(204)
  async banUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`banUser: ${target} -> ${roomId} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, by) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === by) {
      throw new BadRequestException('자신을 밴할 수 없습니다.');
    }
    await this.chatroomsService.banUser(roomId, target, by);
    this.eventRunner.emit('room:leave', roomId, [target], true);
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 밴당했습니다.`);
  }

  /**
   * 밴된 사용자를 밴 해제합니다.
   * 밴 해제하는 사용자가 권한이 없거나 자기 자신을 밴 해제하거나 존재하지 않는 사용자면 에러가 발생합니다.
   *
   * @param target 밴 해제할 사용자 ID
   * @param roomId 밴 해제할 방 ID
   * @param by 밴 해제하는 관리자 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '밴 해제하는 관리자 ID (제거 예정)',
  })
  @Delete('ban/:target/:roomId/:by')
  @HttpCode(204)
  async unbanUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`unbanUser: ${target} -> ${roomId} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isMaster(roomId, by) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === by) {
      throw new BadRequestException('자신을 밴 해제할 수 없습니다.');
    }
    await this.chatroomsService.unbanUser(roomId, target);
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 밴 해제되었습니다.`);
  }

  /**
   * 특정 사용자를 뮤트시킵니다.
   * 뮤트하는 사용자가 권한이 없거나 자기 자신을 뮤트하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 뮤트할 사용자 ID
   * @param roomId 뮤트할 방 ID
   * @param by 뮤트하는 관리자 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '뮤트하는 관리자 ID (제거 예정)',
  })
  @Put('mute/:target/:roomId/:time/:by')
  @HttpCode(204)
  async muteUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @Param('time', ParseIntPipe) time: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`muteUser: ${target} -> ${roomId} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    if (time < 0 || time > (60 * 60 * 24)) {
      throw new BadRequestException('차단 시간은 0에서 24시간 사이의 초 단위의 숫자여야 합니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, by) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (await this.chatroomsService.isNormalUser(roomId, target) === false) {
      throw new BadRequestException('같은 관리자에게 뮤트할 수 없습니다.');
    }
    if (target === by) {
      throw new BadRequestException('자신을 뮤트할 수 없습니다.');
    }
    await this.chatroomsService.muteUser(roomId, target, by, time);
    // 뮤트 유저 캐시에 등록 필요하고 뮤트된 여부를 방 유저들에게 알려주어야 함.
    this.eventRunner.emit('room:notify', roomId, `${target} 님이 뮤트되었습니다.`);
  }

  /**
   * 뮤트된 사용자를 해제합니다. 뮤트 해제에 성공하면 뮤트 유저 캐시에서 제거하고 뮤트 해제된 사실을 방 유저들에게 알려줍니다.
   * 뮤트되있지 않은 사용자에게 뮤트를 시도하거나 해제하는 사용자가 권한이 없거나 자기 자신을 해제하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 뮤트 해제할 사용자 ID
   * @param roomId 뮤트 해제할 방 ID
   * @param by 뮤트 해제하는 관리자 ID
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
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '뮤트 해제하는 관리자 ID (제거 예정)',
  })
  @Delete('mute/:target/:roomId/:by')
  @HttpCode(204)
  async unmuteUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('roomId', ParseIntPipe) roomId: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`unmuteUser: ${target} -> ${roomId} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    await this.chatroomsService.checkRooms([roomId]);
    if (await this.chatroomsService.isNormalUser(roomId, by) === true) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (target === by) {
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
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 차단할 사용자 ID
   * @param by 차단하는 사람의 ID
   * @returns 차단 성공 여부
   */
  @ApiOperation({ summary: '사용자 차단', description: '사용자를 차단합니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '차단 성공' })
  @ApiResponse({ status: 400, description: '차단할 사용자가 존재하지 않거나 자신을 차단하려는 경우 에러가 발생합니다.' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '차단할 사용자 ID',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '차단하는 사람의 ID',
  })
  @Put('block/:target/:by')
  @HttpCode(204)
  async blockUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`blockUser: ${target} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    if (target === by) {
      throw new BadRequestException('자신을 차단할 수 없습니다.');
    }
    const result = await this.chatroomsService.blockUser(by, target);
    if (result === false) {
      throw new BadRequestException('이미 차단된 사용자입니다.');
    }
  }

  /**
   * 차단한 사용자의 차단을 풉니다.
   * 차단되어 있지 않거나 차단을 풀려는 사용자가 존재하지 않거나 본인에 대해 수행할경우 에러가 발생합니다.
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 차단을 푸려는 사용자 ID
   * @param by 차단하는 사람의 ID
   * @returns 차단 성공 여부
   */
  @ApiOperation({ summary: '사용자 차단 해제', description: '차단한 사용자의 차단을 풉니다. 성공시 HTTP 204 (No content)를 리턴합니다.' })
  @ApiResponse({ status: 204, description: '차단 해제 성공' })
  @ApiResponse({ status: 400, description: '차단되어 있지 않거나 차단을 풀려는 사용자가 존재하지 않거나 본인에 대해 수행할경우 에러가 발생합니다.' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '차단을 푸려는 사용자 ID',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '차단하는 사람의 ID (제거 예정)',
  })
  @Delete('block/:target/:by')
  @HttpCode(204)
  async unblockUser(
    @Param('target', ParseIntPipe) target: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<void> {
    this.logger.debug(`blockUser: ${target} -> ${by}`);
    await this.chatroomsService.checkUsers([target, by]);
    if (target === by) {
      throw new BadRequestException('자신에 대해 차단 해제를 할 수 없습니다.');
    }
    const result = await this.chatroomsService.unblockUser(by, target);
    if (result === false) {
      throw new BadRequestException('이미 차단해제된 사용자입니다.');
    }
  }

  /**
   * 채팅방 ID와 채팅 메시지의 고유 ID를 받아 이전 채팅을 가져옵니다.
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID
   * @param msgID 채팅 메시지의 고유 ID
   * @param by 요청한 사람 ID
   * @returns 채팅 메시지를 반환합니다.
   */
  @ApiOperation({
    summary: '채팅 메시지 조회',
    description: '채팅 메시지 조회 기능입니다. 기준이 되는 메시지 (msgID) 이전의 채팅을 가져오며, msgID가 -1일시 가장 최신의 메시지부터 가져옵니다.',
  })
  @ApiResponse({ status: 200, type: [MessageDataDto], description: '채팅 메시지 조회 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @ApiParam({
    name: 'msgID', type: Number, example: -1, description: '메시지 고유 ID',
  })
  @ApiParam({
    name: 'count', type: Number, example: 10, description: '가져올 메시지 개수',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '요청한 사람의 ID (제거 예정)',
  })
  @Get('message/:roomId/:msgID/:count/:by')
  async getMessage(
    @Param('roomId', ParseIntPipe) roomId: number,
      @Param('msgID', ParseIntPipe) msgID: number,
      @Param('count', ParseIntPipe) count: number,
      @Param('by', ParseIntPipe) by: number,
  ): Promise<Array<MessageDataDto>> {
    await this.chatroomsService.checkUsers([by]);
    await this.chatroomsService.checkRooms([roomId]);
    const messages = await this.chatroomsService.getMessages(
      roomId,
      msgID,
      count,
      by,
    );
    return messages;
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
