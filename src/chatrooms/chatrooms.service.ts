import {
  BadRequestException,
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import ChatRepository from './chat.repository';
import { CreateRoomDto } from './dto/create-room.dto';
import { MessageDataDto } from './dto/message-data.dto';
import MessageRepository from './message.repository';

@Injectable()
export default class ChatroomsService {
  private readonly logger = new Logger(ChatroomsService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private messageRepository: MessageRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * nestjs의 캐시 매니저와 스케줄러를 이용해 Inline Cache의 Write-Behind를 구현합니다.
   * 매분 정각에 해당 코드를 실행합니다.
   */
  @Cron('0 * * * * *')
  async writeBehind(): Promise<void> {
    const chatCache: undefined | Array<MessageDataDto> = await this.cacheManager.get('chat');
    const chatIndex: undefined | number = await this.cacheManager.get('chat_index');
    await this.cacheManager.set('chat_index', chatIndex, { ttl: 120 });
    if (chatCache !== undefined && chatIndex !== undefined) {
      const len = chatCache.length;
      this.logger.debug(`DB에 저장된 채팅 메시지 수: ${len}`);
      this.messageRepository.saveMessages(chatCache);
      await this.cacheManager.del('chat');
    }
  }

  /**
   * nestjs의 캐시 매니저를 이용해 읽기 작업의 Look-Aside를 구현합니다.
   * msgSeq 이전의 메세지를 가져옵니다.
   *
   * @param chatSeq 방 ID
   * @param msgSeq 메시지 ID
   * @param limit 제한
   * @returns 읽기 작업의 Look-Aside를 구현한 메시지 배열
   */
  async cacheChatRead(
    chatSeq: number,
    msgSeq: number,
    limit: number,
  ): Promise<Array<MessageDataDto>> {
    let limitCnt = limit;
    let newMsgSeq = msgSeq;
    if (msgSeq < 0) {
      let msgSeqTmp: undefined | number = await this.cacheManager.get('chat_index');
      if (msgSeqTmp === undefined) {
        msgSeqTmp = await this.messageRepository.getLastChatIndex() + 1;
      }
      newMsgSeq = msgSeqTmp;
    }
    this.logger.debug(`cacheChatRead: 방 ID: ${chatSeq}, 메시지 ID: ${newMsgSeq}, 제한: ${limitCnt}`);
    // TODO: 값들이 유효하지 않을 때 핸들링 필요
    let filteredChats: Array<MessageDataDto> = [];
    const cache: undefined | Array<MessageDataDto> = await this.cacheManager.get('chat');
    if (cache === undefined) {
      filteredChats = this.messageRepository.getMessages(chatSeq, newMsgSeq, limitCnt);
    } else {
      for (let index = cache.length - 1; index >= 0; index -= 1) {
        if (cache[index].chatSeq === chatSeq && cache[index].msgSeq < newMsgSeq && limitCnt !== 0) {
          filteredChats.push(cache[index]);
          limitCnt -= 1;
        }
      }
      if (limitCnt !== 0) {
        const dbrtn = this.messageRepository.getMessages(chatSeq, newMsgSeq, limitCnt);
        filteredChats.push(...dbrtn);
      }
    }
    return filteredChats;
  }

  /**
   * nestjs의 캐시 매니저를 이용해 Inline Cache의 Write-Behind를 구현합니다.
   *
   * @param chat 새 채팅 객체
   * @returns 해당 채팅의 고유 ID
   */
  async cacheChatWrite(chat: MessageDataDto): Promise<number> {
    let chatIndex: undefined | number = await this.cacheManager.get('chat_index');
    if (chatIndex === undefined) {
      chatIndex = await this.messageRepository.getLastChatIndex() + 1;
    }
    const chatData: MessageDataDto = {
      msgSeq: chatIndex,
      partcSeq: chat.partcSeq,
      chatSeq: chat.chatSeq,
      msg: chat.msg,
      createAt: chat.createAt,
    };
    await this.cacheManager.set('chat_index', chatIndex + 1, { ttl: 120 });
    const chatCache: undefined | Array<MessageDataDto> = await this.cacheManager.get('chat');
    if (chatCache === undefined) {
      await this.cacheManager.set('chat', [chatData], { ttl: 120 });
    } else {
      chatCache.push(chatData);
    }
    return chatIndex;
  }

  /**
   * 새 채팅 메시지를 받아 캐시에 저장하고 채팅 메시지에 대한 고유 ID를 반환합니다.
   *
   * @param from 메시지 작성자
   * @param chatSeq 방 ID
   * @param msg
   * @returns 채팅 메시지 고유 ID
   */
  async newChat(from: string, chatSeq: number, msg: string): Promise<number> {
    return this.cacheChatWrite({
      msgSeq: -1,
      partcSeq: from,
      chatSeq,
      msg,
      createAt: new Date(),
    });
  }

  /**
   * 특정 방의 특정 메시지 이전의 채팅을 limit만큼 가져옵니다.
   *
   * @param chatSeq 방 ID
   * @param messageId 메시지 ID
   * @param limit 제한
   * @returns 채팅 배열
   */
  async getMessages(chatSeq: number, messageId: number, limit: number): Promise<Array<MessageDataDto>> {
    const rtn = await this.cacheChatRead(chatSeq, messageId, limit);
    return rtn;
  }

  /**
   * 사용자가 접속하면 온라인 사용자 리스트에 추가합니다.
   * 접속한 사용자 ID와 소켓 ID를 연결합니다.
   *
   * @param user 접속한 사용자 소켓
   * @param username 접속한 사용자 식별자 (이름)
   */
  async onlineUserAdd(user: Socket, username: string): Promise<void> {
    // 현재 접속 세션이 생성된 소켓의 고유 ID와 사용자 식별 ID를 저장합니다.
    await this.cacheManager.set(user.id, username);
  }

  /**
   * 사용자 연결이 해제되면 온라인 사용자 리스트에서 제거합니다.
   *
   * @param user 사용자 소켓
   */
  async onlineUserRemove(user: Socket): Promise<void> {
    // 클라이언트와 채팅 소켓 연결이 끊어지면 정보를 제거합니다.
    await this.cacheManager.del(user.id);
  }

  /**
   * 소켓 연결 단계에서 클라이언트로부터 전송된 사용자 이름을 가져옵니다.
   * 추후에 사용자 검증을 하는 함수로 리펙터링해야 합니다.
   *
   * @param user 클라이언트 소켓
   * @returns 사용자 이름 (없으면 undefined)
   */
  getUserName(user: Socket): string | undefined {
    return user.handshake.auth.username;
  }

  /**
   * 접속한 클라이언트 소켓을 소속되어 있는 모든 룸에 추가하고 소속된 룸을 반환합니다.
   *
   * @param user 클라이언트 소켓
   * @param username 클라이언트 식별자 (이름)
   * @returns 소속된 룸 목록
   */
  roomJoin(user: Socket, username: string): any[] {
    const rooms = this.chatRepository.findRoomsByUserId(username);
    const rtn = [];
    rooms.forEach((room) => { // FIXME : 타입 명시 필요
      user.join(room.chatSeq.toString()); // 본인이 속한 룸에 조인
      rtn.push(room.chatSeq);
    });
    return rtn;
  }

  /**
   * 서버 소켓 객체 내의 클라이언트들 중 특정 클라이언트들을 룸에 추가합니다.
   *
   * @param server 서버 소켓 객체
   * @param chatSeq 룸 식별자
   * @param users 추가할 클라이언트 식별자 목록
   */
  async roomAddUsers(server: Server, chatSeq: number, users: string[]): Promise<void> {
    // NOTE: 전체적으로 리팩터링 예정
    // Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, socket] of (server.sockets as any)) { // FIXME : 타입 명시 필요
      // eslint-disable-next-line no-await-in-loop
      const clientId : undefined | string = await this.cacheManager.get(id);
      if (clientId && users.includes(clientId)) {
        socket.join(chatSeq.toString());
      }
    }
  }

  /**
   * 서버 소켓 객체 내의 특정 클라이언트를 룸에서 내보냅니다.
   *
   * @param server 서버 소켓 객체
   * @param chatSeq 룸 식별자
   * @param user 추가할 클라이언트 식별자 목록
   */
  async roomLeaveUser(server: Server, chatSeq: number, user: string): Promise<void> {
    // NOTE: 전체적으로 리팩터링 예정
    // Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, socket] of (server.sockets as any)) { // FIXME : 타입 명시 필요
      // eslint-disable-next-line no-await-in-loop
      const clientId : undefined | string = await this.cacheManager.get(id);
      if (clientId && clientId === user) {
        socket.leave(chatSeq.toString());
      }
    }
  }

  /**
   * 클라이언트를 모든 룸에서 제거합니다. (방에서 나가는게 아닙니다.)
   *
   * @param user 클라이언트 소켓
   */
  roomLeave(user: Socket): void {
    const username = this.getUserName(user);
    const rooms = this.chatRepository.findRoomsByUserId(username);
    rooms.forEach((room) => {
      user.leave(room.chatSeq.toString()); // 본인이 속한 룸에서 떠나기
    });
  }

  /**
   * 새로운 방을 생성합니다. (소켓의 룸과 다릅니다.)
   *
   * @param create 생성할 방 정보
   * @returns 생성된 방 고유 ID
   */
  addRoom(create: CreateRoomDto): number {
    if (this.chatRepository.findRoomByRoomName(create.chatName)) {
      throw new BadRequestException('이미 존재하는 이름의 방입니다.');
    }
    return this.chatRepository.addRoom(create).chatSeq;
  }

  /**
   * 방이 전체 공개방인지 아닌지의 여부를 판별합니다.
   *
   * @param room 방 정보
   * @returns 방이 전체 공개방인지 아닌지
   */
  isPublic(roomType: string): boolean {
    return roomType === 'CHTP20';
  }

  /**
   * 특정 방에 사용자들을 추가합니다.
   *
   * @param chatSeq 방 식별자
   * @param users 추가할 사용자 식별자 목록
   * @returns 추가 성공 여부
   */
  addUser(chatSeq: number, users: any[]): boolean {
    return this.chatRepository.addUser(chatSeq, users);
  }

  /**
   * 특정 방에서 사용자를 제거합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 제거할 사용자 식별자
   * @returns 제거 성공 여부
   */
  leftUser(chatSeq: any, user: any): boolean {
    return this.chatRepository.removeUser(chatSeq, user);
  }

  /**
   * 소켓 고유 ID를 이용해 실사용자의 ID를 가져옵니다.
   *
   * @param user 클라이언트 소켓
   * @returns 사용자 ID
   */
  async whoAmI(user: Socket): Promise<string> {
    return this.cacheManager.get(user.id);
  }

  /**
   * 데이터베이스에 저장된 모든 룸을 반환합니다.
   *
   * @returns 모든 룸 목록
   */
  findAllRooms(): any[] {
    return this.chatRepository.findAllRooms();
  }
}
