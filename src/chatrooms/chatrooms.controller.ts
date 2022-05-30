import {
  Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiTags, ApiResponse, ApiOperation, ApiParam,
} from '@nestjs/swagger';
import ChatroomsService from './chatrooms.service';
import { ChatRoomDto } from './dto/chat-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { IJoinRoomResult } from './interface/join-room';
import { AddRoomResultDto } from './dto/add-room-result.dto';
import { MessageDataDto } from './dto/message-data.dto';
import ChatRoomResultDto from './dto/chat-room-result.dto';

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
   * 새 방을 만듭니다. 방에 참여하는 유저는 본인 스스로를 추가합니다.
   * 현재는 아무도 추가하지 않으며 추후에 사용자 ID는 세션에서 가져올 예정입니다.
   *
   * @param create
   * @returns 방 정보
   */
  @ApiOperation({ summary: '방 만들기', description: '방을 만듭니다. 성공시 HTTP 201과 방 ID, 방 제목을 리턴합니다.' })
  @ApiResponse({ status: 201, type: AddRoomResultDto, description: '방 생성 성공' })
  @ApiResponse({ status: 400, description: 'Body Field Error' })
  @Post('new')
  @HttpCode(201)
  addRoom(
    @Body() reqData: ChatRoomDto,
  ): AddRoomResultDto {
    this.logger.debug(`addRoom: ${reqData.chatName}`);
    const roomno = this.chatroomsService.addRoom(reqData);
    this.eventRunner.emit('room:create', roomno, null, reqData.chatType);
    const rtn: AddRoomResultDto = {
      chatSeq: roomno,
      chatName: reqData.chatName,
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
  @ApiResponse({ status: 400, description: 'Body Field Error' })
  @ApiParam({
    name: 'roomId', type: Number, example: 1, description: '방 ID',
  })
  @Put('join/:roomId/:userId')
  joinRoom(
    @Param('roomId') roomId: string,
      @Param('userId') userId: string,
      @Body() data: JoinRoomDto,
  ): string {
    this.logger.debug(`joinRoom: body -> ${JSON.stringify(data)}`);
    const roomid = Number(roomId);
    const user = Number(userId);
    const result = this.chatroomsService.addUser(roomid, [user]);
    if (result) {
      this.eventRunner.emit('room:join', roomid, [user]);
      const rtn: IJoinRoomResult = {
        chatSeq: roomid,
      };
      return JSON.stringify(rtn);
    }
    return 'error'; // FIXME: 에러 코드 정의 필요
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
      this.eventRunner.emit('room:leave', roomid, user);
    }
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
