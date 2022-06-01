import {
  BadRequestException,
  Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiTags, ApiResponse, ApiOperation, ApiParam,
} from '@nestjs/swagger';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import ChatroomsService from './chatrooms.service';
import { ChatRoomDto } from './dto/chat-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { IJoinRoomResult } from './interface/join-room';
import { AddRoomResultDto } from './dto/add-room-result.dto';
import { MessageDataDto } from './dto/message-data.dto';
import ChatRoomResultDto from './dto/chat-room-result.dto';

// TODO URI 파라미터로 들어오는 값에 파이프 적용 고려

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
   * @param reqData
   * @returns 방 정보
   */
  @ApiOperation({ summary: '방 만들기', description: '방을 만듭니다. 성공시 HTTP 201과 방 ID, 방 제목을 리턴합니다.' })
  @ApiResponse({ status: 201, type: AddRoomResultDto, description: '방 생성 성공' })
  @ApiResponse({ status: 400, description: 'Body Field Error' })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '유저 ID (제거 예정)',
  })
  @Post('new/:by')
  @HttpCode(201)
  async addRoom(
    @Body() reqData: ChatRoomDto,
      @Param('by') by: string,
  ): Promise<AddRoomResultDto> {
    const owner = Number(by);
    this.logger.debug(`addRoom: ${reqData.chatName}`);
    const roomno = await this.chatroomsService.addRoom(reqData);
    if (roomno === -1) {
      throw new BadRequestException('요청이 유효하지 않습니다. (방제 중복 또는 요청 파라미터 에러)');
    }
    await this.chatroomsService.addOwner(roomno, owner);
    this.eventRunner.emit('room:join', roomno, [owner]);
    const rtn: AddRoomResultDto = {
      chatSeq: roomno,
      chatName: reqData.chatName,
    };
    return rtn;
  }

  /**
   * 새 디엠 방을 만듭니다. 방에 참여하는 유저와 초대하고자 하는 유저를 추가합니다.
   * 추후에 본인 ID는 세션에서 가져올 예정입니다.
   *
   * @param who 디엠 보낼 사람
   * @returns 방 정보
   */
  @ApiOperation({ summary: '디엠 방 만들기', description: '디엠 방을 만듭니다. 성공시 HTTP 201과 방 ID를 리턴합니다.' })
  @ApiResponse({ status: 201, type: AddRoomResultDto, description: '방 생성 성공' })
  @ApiResponse({ status: 400, description: 'Body Field Error' })
  @ApiParam({
    name: 'who', type: Number, example: 1, description: '초대받는 유저 ID',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '유저 ID (제거 예정)',
  })
  @Post('new/dm/:who/:by')
  @HttpCode(201)
  async addDM(
    @Param('who') who: string,
      @Param('by') by: string,
  ): Promise<AddRoomResultDto> {
    const inviter = Number(by);
    const invitee = Number(who);
    this.logger.debug(`addDM: ${invitee}`);
    // TODO inviter, invitee 에 대한 유효성 검사 필요
    const roomno = await this.chatroomsService.addDM(inviter, invitee);
    if (roomno === -1) {
      throw new BadRequestException('요청이 유효하지 않습니다. (중복 DM방)');
    }
    await this.chatroomsService.addNormalUsers(roomno, [inviter, invitee]);
    this.eventRunner.emit('room:join', roomno, [inviter, invitee]);
    const rtn: AddRoomResultDto = {
      chatSeq: roomno,
    };
    return rtn;
  }

  /**
   * 사용자의 방 입장 요청을 처리합니다.
   * 추후에 사용자 ID는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID (NOTE: 방 ID는 숫자인데 nest가 별도로 형변환을 하지 않습니다.)
   * @param data POST data
   * @returns 조인 여부와 방 ID를 반환합니다.
   */
  @ApiOperation({ summary: '클라이언트의 방 입장 요청 처리', description: '사용자가 방에 입장하려고 합니다. 사용자 ID는 추후에 세션으로부터 가져옵니다.' })
  @ApiResponse({ status: 200, description: '방 참여 성공' })
  @ApiResponse({ status: 400, description: '비밀번호가 틀렸거나 존재하지 않는 방' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @Put('join/:roomId/:userId')
  async joinRoom(
    @Param('roomId') roomId: string,
      @Param('userId') userId: string,
      @Body() data: JoinRoomDto,
  ): Promise<string> {
    this.logger.debug(`joinRoom: body -> ${JSON.stringify(data)}`);
    const roomid = Number(roomId);
    const user = Number(userId);
    const roomType = await this.chatroomsService.getRoomType(roomid);
    if (roomType === undefined) {
      throw new BadRequestException('존재하지 않는 방입니다.');
    } else if (roomType === ChatType.CHTP10) {
      throw new BadRequestException('디엠엔 입장할 수 없습니다.');
    }
    const result = await this.chatroomsService.joinRoomByExUser(roomid, user, data.password);
    if (result === false) {
      throw new BadRequestException('비밀번호가 틀렸습니다.');
    }
    this.eventRunner.emit('room:join', roomid, [user]);
    const rtn: IJoinRoomResult = {
      chatSeq: roomid,
    };
    return JSON.stringify(rtn);
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
  @ApiOperation({ summary: '사용자를 방에 초대합니다.', description: '사용자를 방에 초대합니다.' })
  @ApiResponse({ status: 200, description: '초대 성공' })
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
  async inviteUser(
    @Param('target') target: string,
      @Param('roomId') roomId: string,
      @Param('by') by: string,
  ): Promise<void> {
    this.logger.debug(`inviteUser: ${target} -> ${roomId} -> ${by}`);
    const targetId = Number(target);
    const roomid = Number(roomId);
    const inviter = Number(by);
    const roomType = await this.chatroomsService.getRoomType(roomid);
    if (roomType === undefined) {
      throw new BadRequestException('존재하지 않는 방입니다.');
    } else if (roomType === ChatType.CHTP10) {
      throw new BadRequestException('디엠엔 입장할 수 없습니다.');
    }
    if (await this.chatroomsService.isMaster(roomid, inviter) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (targetId === inviter) {
      throw new BadRequestException('자신을 초대할 수 없습니다.');
    }
    await this.chatroomsService.addNormalUsers(roomid, [targetId]);
    this.eventRunner.emit('room:join', roomid, [targetId]);
  }

  /**
   * 특정 방에서 나가기 요청을 처리합니다.
   * 추후에 사용자 ID는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID (NOTE: 방 ID는 숫자인데 nest가 별도로 형변환을 하지 않습니다.)
   * @param data POST data
   * @returns 나기기 여부와 방 ID를 반환합니다.
   */
  @ApiOperation({ summary: '클라이언트의 방 퇴장 요청 처리', description: '사용자가 방에서 나가려고 합니다. 사용자 ID는 세션으로부터 가져옵니다.' })
  @ApiResponse({ status: 204, description: '방 나가기 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @ApiParam({
    name: 'userId', type: Number, example: 1, description: '방 ID (제거 예정)',
  })
  @Delete('leave/:roomId/:userId')
  @HttpCode(204)
  leaveRoom(
    @Param('roomId') roomId: string,
      @Param('userId') userId: string,
  ): void {
    const roomid = Number(roomId);
    const user = Number(userId);
    const result = this.chatroomsService.leftUser(roomid, user);
    if (result) {
      this.eventRunner.emit('room:leave', roomid, user, false);
    }
  }

  /**
   * 특정 사용자를 방에서 강퇴합니다.
   * 초대하는 사용자가 권한이 없거나 자기 자신을 강퇴하거나 존재하지 않는 사용자면 에러가 발생합니다.
   * 추후에 사용자 ID (본인)는 세션에서 가져올 예정입니다.
   *
   * @param target 강퇴할 사용자 ID
   * @param roomId 강퇴할 방 ID
   * @param by 강퇴하는 관리자 ID
   */
  @ApiOperation({ summary: '사용자를 방에서 강퇴합니다.', description: '사용자를 방에서 강퇴합니다.' })
  @ApiResponse({ status: 200, description: '강퇴 성공' })
  @ApiResponse({ status: 400, description: '강퇴할 사용자가 존재하지 않거나 자신을 강퇴하거나 존재하지 않는 방' })
  @ApiParam({
    name: 'target', type: Number, example: 1, description: '강퇴할 사용자 ID',
  })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '강퇴할 방 ID',
  })
  @ApiParam({
    name: 'by', type: Number, example: 1, description: '강퇴하는 관리자 ID',
  })
  @Delete('kick/:target/:roomId/:by')
  async kickUser(
    @Param('target') target: string,
      @Param('roomId') roomId: string,
      @Param('by') by: string,
  ): Promise<void> {
    this.logger.debug(`kickUser: ${target} -> ${roomId} -> ${by}`);
    const targetId = Number(target);
    const roomno = Number(roomId);
    const who = Number(by);
    if (await this.chatroomsService.isMaster(roomno, who) === false) {
      throw new BadRequestException('권한이 없습니다.');
    }
    if (targetId === who) {
      throw new BadRequestException('자신을 강퇴할 수 없습니다.');
    }
    const result = this.chatroomsService.leftUser(roomno, targetId);
    if (result === false) {
      throw new BadRequestException('존재하지 않는 사용자입니다.');
    }
    this.eventRunner.emit('room:leave', roomno, [targetId], true);
  }

  /**
   * 채팅방 ID와 채팅 메시지의 고유 ID를 받아 이전 채팅을 가져옵니다.
   *
   * @param roomId 방 ID (NOTE: 방 ID는 방 고유 ID-숫자이며 nest가 별도로 형변환을 하지 않습니다.)
   * @param msgID 채팅 메시지의 고유 ID
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
  @Get('message/:roomId/:msgID/:count')
  async getMessage(
    @Param('roomId') roomId: string,
      @Param('msgID') msgID: string,
      @Param('count') count: string,
  ): Promise<Array<MessageDataDto>> {
    const messages = await this.chatroomsService.getMessages(
      Number(roomId),
      Number(msgID),
      Number(count),
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
  @ApiResponse({ status: 200, type: ChatRoomResultDto, description: '방 정보 조회 성공' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @Get('room/:roomId')
  async getRoom(@Param('roomId') roomId: string): Promise<ChatRoomResultDto> {
    this.logger.debug(`getRoom: ${roomId}`);
    const room = await this.chatroomsService.getRoomInfo(Number(roomId));
    return room;
  }

  /**
   * 방을 검색합니다. DM과 비공개 방은 제외합니다.
   *
   * @param searchKeyword 검색 키워드
   * @param page 페이지 번호
   * @param count 페이지당 방 개수
   * @returns 검색 결과를 반환합니다.
   * @example
   */
  @ApiOperation({ summary: '방 검색', description: '방 검색 기능입니다. 검색 키워드와 페이지 번호를 입력하여 검색 결과를 반환합니다.' })
  @ApiResponse({ status: 200, type: [ChatRoomResultDto], description: '방 검색 성공' })
  @ApiParam({
    name: 'searchKeyword', type: String, example: '푸주', description: '검색 키워드',
  })
  @ApiParam({
    name: 'page', type: Number, example: 1, description: '페이지 번호',
  })
  @ApiParam({
    name: 'count', type: Number, example: 10, description: '페이지당 방 개수',
  })
  @Get('search/:searchKeyword/:page/:count')
  async searchChatroom(
    @Param('searchKeyword') searchKeyword: string,
      @Param('page') page: string,
      @Param('count') count: string,
  ): Promise<Array<ChatRoomResultDto>> {
    const result = await this.chatroomsService.searchChatroom(
      searchKeyword,
      Number(page),
      Number(count),
    );
    return result;
  }
}
