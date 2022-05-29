import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import ChatroomsService from './chatrooms.service';

/**
 * socket 네임스페이스로 들어오는 소켓 요청들을 처리하는 게이트웨이
 * 소켓 요청과 응답은 모두 이 게이트웨이에서 처리합니다.
 *
 * @author joohongpark
 */
@WebSocketGateway({ namespace: 'chatrooms' })
export class ChatroomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatroomsGateway.name);

  constructor(
    private readonly chatroomsService: ChatroomsService,
  ) { }

  /**
   * 서버 측 소켓 객체
   */
  @WebSocketServer()
    server: Server;

  /**
   * 신규로 연결된 클라이언트 소켓을 처리하는 함수
   * 해당 함수가 호출되는 조건은 클라이언트에서 채팅 연결을 시작할 때 한번만 호출됩니다.
   * 클라이언트에게 현재 존재하는 방 목록을 송부하고 클라이언트를 클라이언트가 존재하는 룸에 추가합니다.
   *
   * @param client 클라이언트 소켓 객체
   */
  async handleConnection(client: Socket) {
    this.logger.debug(`handleConnection: ${client.id} connected`);
    // TODO
    // 사용자 인증을 분리하는 방안 필요 (인증 실패 시 연결 끊기)
    const username = this.chatroomsService.getUserName(client);
    if (username === undefined) {
      throw new Error('Auth Error');
    }

    // 현재 접속 세션이 생성된 소켓의 고유 ID와 사용자 식별 ID를 저장합니다.
    await this.chatroomsService.onlineUserAdd(client, username);

    // 본인이 속한 룸에 조인시킵니다. 그리고 본인이 속한 룸의 리스트를 리턴합니다.
    const roomList = this.chatroomsService.roomJoin(client, username);

    // 클라이언트가 속한 룸 리스트와 아닌 리스트를 산정합니다. (리팩터링 필요)
    const rtn = this.chatroomsService.findAllRooms();
    // FIXME: 추후에 리팩터링 할 코드이기 때문에 Eslint는 주석으로 피합니다.
    rtn.forEach((room) => {
      if (roomList.includes(room.chatSeq)) {
        // eslint-disable-next-line no-param-reassign
        room.isJoined = true;
      } else {
        // eslint-disable-next-line no-param-reassign
        room.isJoined = false;
      }
    });

    // 룸 리스트를 클라이언트에 전송합니다.
    client.emit('rooms', rtn);
  }

  /**
   * 클라이언트 소켓이 끊어질 때 동작을 처리하는 함수
   * 해당 함수가 호출되는 조건은 클라이언트가 채팅 관련 소켓을 끊을 때 호출됩니다.
   * 클라이언트를 클라이언트가 존재하는 룸에서 제거합니다.
   *
   * @param client 클라이언트 소켓 객체
   */
  async handleDisconnect(client: Socket) {
    this.logger.debug(`handleDisconnect: ${client.id} disconnected`);
    // 본인이 속한 룸에서 나갑니다.
    this.chatroomsService.roomLeave(client);

    // 클라이언트와 채팅 소켓 연결이 끊어지면 정보를 제거합니다.
    await this.chatroomsService.onlineUserRemove(client);
  }

  /**
   * 클라이언트에서 새로운 채팅이 감지되면 클라이언트가 속한 룸에 메시지를 송부합니다.
   *
   * @param client 클라이언트 소켓 객체
   */
  @SubscribeMessage('chat')
  async handleChat(client: Socket, message: any) {
    this.logger.debug(`handleChat: ${client.id} sent message: ${message.content}`);
    // client.rooms은 클라이언트가 속한 룸 리스트를 담고 있습니다.
    const { rooms } = client;
    const name = await this.chatroomsService.whoAmI(client);
    if (rooms.has(message.at.toString()) && name !== undefined) {
      const seq = await this.chatroomsService.newChat(name, message.at, message.content);
      this.server.to(message.at.toString()).emit('chat', { ...message, user: name, seq });
    }
  }

  /**
   * 방을 생성하는 HTTP 요청을 받을 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param users 유저 ID 배열
   * @param chatType
   */
  @OnEvent('room:create')
  async onRoomCreate(chatSeq: number, users: string[] | null, chatType: string) {
    this.logger.debug(`onRoomCreated: ${chatSeq}`);
    if (users) {
      // 클라이언트 ID 배열을 이용해 접속중인 클라이언트 소켓에게 룸 조인을 시킵니다.
      await this.chatroomsService.roomAddUsers(this.server, chatSeq, users);
    }
    // 공개방일 때에만 전체에 방 개설 사실을 알리며 그 이외에 경우엔 룸에 참가한 사람에게만 보냅니다.
    if (this.chatroomsService.isPublic(chatType)) {
      this.server.emit('new room', { chatSeq });
    } else {
      this.server.to(chatSeq.toString()).emit('new room', { chatSeq });
    }
  }

  /**
   * 방에 합류하는 HTTP 요청을 받을 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param users 유저 ID 배열
   */
  @OnEvent('room:join')
  async onRoomJoin(chatSeq: number, users: any[]) {
    this.logger.debug(`onRoomJoined: ${chatSeq}, users: ${users}`);
    // 클라이언트 ID 배열을 이용해 접속중인 클라이언트 소켓에게 룸 조인을 시킵니다.
    await this.chatroomsService.roomAddUsers(this.server, chatSeq, users);
    // 룸에 참가한 사람에게 룸에 참가했다는 내용을 보냅니다.
    this.server.to(chatSeq.toString()).emit('join room', { chatSeq, users });
  }

  /**
   * 유저를 방에서 내보낼 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param user 유저 ID
   */
  @OnEvent('room:leave')
  async onRoomLeave(chatSeq: number, user: string) {
    this.logger.debug(`onRoomLeft: ${chatSeq}, user: ${user}`);
    // 본인 포함 방에서 내보낸 (나간) 유저가 나갔다고 해당 룸에 들어가 있는 클라이언트들에게 알립니다.
    this.server.to(chatSeq.toString()).emit('user leave', { chatSeq, user });
    // 유저를 룸에서 내보냅니다 (나갑니다).
    await this.chatroomsService.roomLeaveUser(this.server, chatSeq, user);
  }
}
