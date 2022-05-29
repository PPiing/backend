import {
  Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import ChatroomsService from './chatrooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { IAddRoomResult } from './interface/add-room';
import { IJoinRoomResult } from './interface/join-room';

@Controller('chatrooms')
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
  @Post('new')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ transform: true }))
  addRoom(
    @Body() reqData: CreateRoomDto,
  ): string {
    this.logger.debug(`addRoom: ${reqData.chatName}`);
    const roomno = this.chatroomsService.addRoom(reqData);
    this.eventRunner.emit('room:create', roomno, null, reqData.chatType);
    const rtn: IAddRoomResult = {
      chatSeq: roomno,
      chatName: reqData.chatName,
    };
    return JSON.stringify(rtn);
  }

  /**
   * 사용자의 방 입장 요청을 처리합니다.
   * 추후에 사용자 ID는 세션에서 가져올 예정입니다.
   *
   * @param roomId 방 ID (NOTE: 방 ID는 숫자인데 nest가 별도로 형변환을 하지 않습니다.)
   * @param data POST data
   * @returns 조인 여부와 방 ID를 반환합니다.
   */
  @Put('join/:roomId')
  joinRoom(
    @Param('roomId') roomId: string,
      @Body() data: JoinRoomDto,
  ): string {
    const roomid = Number(roomId);
    const result = this.chatroomsService.addUser(roomid, [data.username]);
    if (result) {
      this.eventRunner.emit('room:join', roomid, [data.username]);
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
  @Delete('leave/:roomId')
  @HttpCode(204)
  leaveRoom(
    @Param('roomId') roomId: string,
      @Body() data: any, // FIXME
  ): void {
    const roomid = Number(roomId);
    const user = data.username;
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
  @Get('message/:roomId/:msgID/:count')
  async getMessage(
    @Param('roomId') roomId: string,
      @Param('msgID') msgID: string,
      @Param('count') count: string,
  ): Promise<string> {
    const messages = await this.chatroomsService.getMessages(
      Number(roomId),
      Number(msgID),
      Number(count),
    );
    return JSON.stringify(messages);
  }
}
