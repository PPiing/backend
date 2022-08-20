import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import { SessionMiddleware } from 'src/session-middleware';
import ChatroomsService from './chatrooms.service';
import ISocketRecv from './interface/socket-recv';
import ISocketSend from './interface/socket-send';

/**
 * socket 네임스페이스로 들어오는 소켓 요청들을 처리하는 게이트웨이
 * 소켓 요청과 응답은 모두 이 게이트웨이에서 처리합니다.
 *
 * @author joohongpark
 */
@WebSocketGateway({ namespace: 'chatrooms' })
export class ChatroomsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatroomsGateway.name);

  constructor(
    private sessionMiddleware: SessionMiddleware,
    private readonly chatroomsService: ChatroomsService,
  ) { }

  /**
   * 소켓에도 세션을 적용하기 위한 미들웨어 적용
   *
   * @param server 소켓 서버측 객체
   */
  afterInit(server: any) {
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
    server.use(wrap(this.sessionMiddleware.expressSession));
    server.use(wrap(this.sessionMiddleware.passportInit));
    server.use(wrap(this.sessionMiddleware.passportSession));
  }

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
  async handleConnection(client: any) {
    const isLogin = client.request.isAuthenticated();
    if (!isLogin) {
      client.disconnect();
      return;
    }
    const { userSeq } = client.request.user;
    const userID = userSeq;
    this.logger.debug(`handleConnection: ${userID} connected`);

    // 현재 접속 세션이 생성된 소켓의 고유 ID와 사용자 식별 ID를 저장합니다.
    await this.chatroomsService.onlineUserAdd(client, userID);

    // 본인이 속한 룸에 조인시킵니다. 그리고 본인이 속한 룸의 리스트를 리턴합니다.
    const roomList = await this.chatroomsService.roomJoin(client, userID);
    const roomDataList = await Promise.all(
      roomList.map((room) => this.chatroomsService.getRoomInfo(room)),
    );

    const data = roomDataList.map((room) => ({
      seq: room.chatSeq,
      type: room.chatType,
      name: room.chatName,
    }));

    // 룸 리스트를 클라이언트에 전송합니다.
    client.emit('chat:init', data);
  }

  /**
   * 클라이언트 소켓이 끊어질 때 동작을 처리하는 함수
   * 해당 함수가 호출되는 조건은 클라이언트가 채팅 관련 소켓을 끊을 때 호출됩니다.
   * 클라이언트를 클라이언트가 존재하는 룸에서 제거합니다.
   *
   * @param client 클라이언트 소켓 객체
   */
  async handleDisconnect(client: any) {
    const { userSeq } = client.request.user;
    const userID = userSeq;
    this.logger.debug(`handleDisconnect: ${userID} disconnected`);
    // 본인이 속한 룸에서 나갑니다.
    await this.chatroomsService.roomLeave(client, userID);

    // 클라이언트와 채팅 소켓 연결이 끊어지면 정보를 제거합니다.
    await this.chatroomsService.onlineUserRemove(client);
  }

  /**
   * 클라이언트에서 새로운 채팅이 감지되면 클라이언트가 속한 룸에 메시지를 송부합니다.
   *
   * @param client 클라이언트 소켓 객체
   */
  @SubscribeMessage('chat')
  async handleChat(client: any, message: ISocketRecv) {
    const { userSeq, nickName } = client.request.user;
    const userID = userSeq;
    this.logger.debug(`handleChat: ${userID} sent message: ${message.content}`);
    // client.rooms은 클라이언트가 속한 룸 리스트를 담고 있습니다.
    const adminId = 0;
    const { rooms } = client;
    const name = userID;
    const muted = await this.chatroomsService.isMuted(message.at, name);
    if (rooms.has(message.at.toString()) && name !== undefined) {
      if (muted === 0) {
        const seq = await this.chatroomsService.newChat(name, message.at, message.content);
        // const exceptUsers = await this.chatroomsService.getBlockedSocketIdList(
        //   name,
        //   message.at,
        //   this.server,
        // );
        const data = {
          chatSeq: message.at,
          userIDs: [name],
          msg: message.content,
          id: seq,
          nickname: nickName,
        };
        this.server.to(message.at.toString()).emit('room:chat', data);
      } else {
        const data: ISocketSend = {
          chatSeq: message.at,
          userIDs: [adminId],
          msg: `현재 mute 상태입니다. ${Math.ceil(muted)} 초 뒤 차단이 풀립니다.`,
          id: -1,
        };
        client.emit('room:chat', data);
      }
    }
  }

  /**
   * 서버에서 생성되는 알림 메시지를 클라이언트에 보내고자 할 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param message 알림성 메시지
   */
  @OnEvent('room:notify')
  async onRoomNotify(chatSeq: number, message: string) {
    this.logger.debug(`onRoomNotify: ${chatSeq} sent message: ${message}`);
    const adminId = 0;
    const seq = await this.chatroomsService.newChat(adminId, chatSeq, message);
    const data: ISocketSend = {
      chatSeq,
      userIDs: [adminId],
      msg: message,
      id: seq,
    };
    this.server.to(chatSeq.toString()).emit('room:chat', data);
  }

  /**
   * 방에 합류하는 HTTP 요청을 받을 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param userIDs 유저 ID 배열
   */
  @OnEvent('room:join')
  async onRoomJoin(chatSeq: number, userIDs: number[]) {
    this.logger.debug(`onRoomJoined: ${chatSeq}, userIDs: ${JSON.stringify(userIDs)}`);
    // 클라이언트 ID 배열을 이용해 접속중인 클라이언트 소켓에게 룸 조인을 시킵니다.
    const data: ISocketSend = {
      chatSeq,
      userIDs,
    };
    await this.chatroomsService.roomAddUsers(this.server, chatSeq, userIDs);
    // 룸에 참가한 사람에게 룸에 참가했다는 내용을 보냅니다.
    this.server.to(chatSeq.toString()).emit('room:join', data);
  }

  /**
   * 유저를 방에서 내보낼 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param user 유저 ID
   */
  @OnEvent('room:leave')
  async onRoomLeave(chatSeq: number, user: number, kicked: boolean) {
    this.logger.debug(`onRoomLeft: ${chatSeq}, user: ${user}`);
    // 본인 포함 방에서 내보낸 (나간) 유저가 나갔다고 해당 룸에 들어가 있는 클라이언트들에게 알립니다.
    const data: ISocketSend = {
      chatSeq,
      userIDs: [user],
      kicked,
    };
    this.server.to(chatSeq.toString()).emit('room:leave', data);
    // 유저를 룸에서 내보냅니다 (나갑니다).
    await this.chatroomsService.roomLeaveUser(this.server, chatSeq, user);
  }

  /**
   * 방의 유저의 권한이 변경될 때 호출되는 콜백함수입니다.
   *
   * @param chatSeq 방 ID
   * @param user 유저 ID
   * @param role 권한
   */
  @OnEvent('room:grant')
  async onRoomGrant(chatSeq: number, user: number, role: PartcAuth) {
    this.logger.debug(`onRoomGrant: ${chatSeq}, user: ${user} to ${role}`);
    // 본인 포함 방에서 내보낸 (나간) 유저가 나갔다고 해당 룸에 들어가 있는 클라이언트들에게 알립니다.
    const data: ISocketSend = {
      chatSeq,
      userIDs: [user],
      role,
    };
    this.server.to(chatSeq.toString()).emit('room:grant', data);
  }
}
