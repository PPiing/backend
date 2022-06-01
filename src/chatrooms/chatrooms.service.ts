import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import ChatParticipantRepository from './chat-participant.repository';
import ChatRepository from './chat.repository';
import ChatRoomResultDto from './dto/chat-room-result.dto';
import { ChatRoomDto } from './dto/chat-room.dto';
import { MessageDataDto } from './dto/message-data.dto';
import MessageRepository from './message.repository';

@Injectable()
export default class ChatroomsService {
  private readonly logger = new Logger(ChatroomsService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private messageRepository: MessageRepository,
    private chatParticipantRepository: ChatParticipantRepository,
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
  async newChat(from: number, chatSeq: number, msg: string): Promise<number> {
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
  async getMessages(
    chatSeq: number,
    messageId: number,
    limit: number,
  ): Promise<Array<MessageDataDto>> {
    const rtn = await this.cacheChatRead(chatSeq, messageId, limit);
    return rtn;
  }

  /**
   * 사용자가 접속하면 온라인 사용자 리스트에 추가합니다.
   * 접속한 사용자 ID와 소켓 ID를 연결합니다.
   *
   * @param user 접속한 사용자 소켓
   * @param userID 접속한 사용자 식별자
   */
  async onlineUserAdd(user: Socket, userID: number): Promise<void> {
    // 현재 접속 세션이 생성된 소켓의 고유 ID와 사용자 식별 ID를 저장합니다.
    await this.cacheManager.set(user.id, userID);
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
   * 소켓 연결 단계에서 클라이언트로부터 전송된 사용자 ID를 가져옵니다.
   * 추후에 사용자 검증을 하는 함수로 리펙터링해야 합니다.
   *
   * @param user 클라이언트 소켓
   * @returns 사용자 ID (없으면 undefined)
   */
  getUserId(user: Socket): number | undefined {
    return Number.isNaN(user.handshake.auth.username)
      ? undefined : Number(user.handshake.auth.username);
  }

  /**
   * 접속한 클라이언트 소켓을 소속되어 있는 모든 룸에 추가하고 소속된 룸을 반환합니다.
   *
   * @param user 클라이언트 소켓
   * @param username 클라이언트 식별자
   * @returns 소속된 룸 목록
   */
  roomJoin(user: Socket, username: number): number[] {
    const rooms = this.chatParticipantRepository.findRoomsByUserId(username);
    const rtn = [];
    rooms.forEach((room) => { // FIXME : 타입 명시 필요
      user.join(room.toString()); // 본인이 속한 룸에 조인
      rtn.push(room);
    });
    return rtn;
  }

  /**
   * 서버 소켓 객체 내의 클라이언트들 중 특정 클라이언트들을 룸에 추가합니다.
   *
   * @param server 서버 소켓 객체
   * @param chatSeq 룸 식별자
   * @param userIDs 추가할 클라이언트 식별자 목록
   */
  async roomAddUsers(server: Server, chatSeq: number, userIDs: number[]): Promise<void> {
    // NOTE: 전체적으로 리팩터링 예정
    // Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, socket] of (server.sockets as any)) { // FIXME : 타입 명시 필요
      // eslint-disable-next-line no-await-in-loop
      const userID : undefined | number = await this.cacheManager.get(id);
      if (userID !== undefined && userIDs.includes(userID)) {
        socket.join(chatSeq.toString());
      }
    }
  }

  /**
   * 서버 소켓 객체 내의 특정 클라이언트를 룸에서 내보냅니다.
   *
   * @param server 서버 소켓 객체
   * @param chatSeq 룸 식별자
   * @param userID 클라이언트 식별자
   */
  async roomLeaveUser(server: Server, chatSeq: number, userID: number): Promise<void> {
    // NOTE: 전체적으로 리팩터링 예정
    // Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, socket] of (server.sockets as any)) { // FIXME : 타입 명시 필요
      // eslint-disable-next-line no-await-in-loop
      const getUserID : undefined | number = await this.cacheManager.get(id);
      if (getUserID !== undefined && getUserID === userID) {
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
    const username = this.getUserId(user);
    const rooms = this.chatParticipantRepository.findRoomsByUserId(username);
    rooms.forEach((room) => {
      user.leave(room.toString()); // 본인이 속한 룸에서 떠나기
    });
  }

  /**
   * 새로운 방을 생성합니다. (소켓의 룸과 다릅니다.)
   *
   * @param create 생성할 방 정보
   * @returns 생성된 방 고유 ID
   */
  async addRoom(create: ChatRoomDto): Promise<number> {
    if (this.chatRepository.findRoomByRoomName(create.chatName)) {
      return -1;
    }
    if (create.chatType === ChatType.CHTP10) {
      return -1; // DM은 여기서 처리하지 않음.
    }
    const hashPassword = create.password ? await bcrypt.hash(create.password, 10) : undefined;
    const hashed = {
      ...create,
      password: hashPassword,
    };
    this.logger.debug(`[ChatRoomService] addRoom : ${JSON.stringify(hashed)}`);
    return this.chatRepository.addRoom(hashed).chatSeq;
  }

  /**
   * 새로운 디엠 방을 생성합니다.
   *
   * @param user1 대화거는 사람 ID
   * @param user2 대화할 사람 ID
   * @returns 생성된 방 고유 ID
   */
  async addDM(user1: number, user2: number): Promise<number> {
    // 기존 디엠 방이 있는지 확인
    if (this.chatRepository.findRoomByRoomName(`DM-${user1}-${user2}`)
     || this.chatRepository.findRoomByRoomName(`DM-${user2}-${user1}`)) {
      return -1;
    }
    // TODO 유저 ID가 올바른지 검증 필요 - 외부에서 처리
    const chatName = `DM-${user1}-${user2}`;
    const newRoom = {
      chatName,
      chatType: ChatType.CHTP10,
    };
    this.logger.debug(`[ChatRoomService] addDM : ${JSON.stringify(newRoom)}`);
    return this.chatRepository.addRoom(newRoom).chatSeq;
  }

  /**
   * 특정 방에 일반 사용자들을 추가합니다.
   *
   * @param chatSeq 방 식별자
   * @param users 추가할 사용자 고유 ID 목록
   * @returns 사용자 식별자 리스트
   */
  async addNormalUsers(chatSeq: number, users: number[]): Promise<void> {
    await this.chatParticipantRepository.addUsers(chatSeq, users);
  }

  /**
   * 방에 사용자를 추가하고 방을 만든 사람을 방장으로 지정합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 방장 고유 ID
   */
  async addOwner(chatSeq: number, user: number): Promise<void> {
    await this.chatParticipantRepository.addUsers(chatSeq, [user]);
    await this.chatParticipantRepository.changeUserAuth(chatSeq, user, PartcAuth.CPAU30);
  }

  /**
   * 특정 방에서 사용자를 제거합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 제거할 사용자 식별자
   * @returns 제거 성공 여부
   */
  leftUser(chatSeq: any, user: any): boolean {
    return this.chatParticipantRepository.removeUser(chatSeq, user);
  }

  /**
   * 소켓 고유 ID를 이용해 실사용자의 ID를 가져옵니다.
   *
   * @param user 클라이언트 소켓
   * @returns 사용자 ID
   */
  async whoAmI(user: Socket): Promise<number> {
    return this.cacheManager.get(user.id);
  }

  /**
   * 외부 접근자가 방에 입장할 때 입장해도 되는지, 올바른 정보를 가지고 있는지 검증합니다.
   * 올바른 정보를 가지고 있다면 방에 입장합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자 (사용자 고유 ID)
   * @param password 비밀번호
   * @returns 성공 여부
   */
  async joinRoomByExUser(
    chatSeq: number,
    user: number,
    password: string | undefined,
  ): Promise<boolean> {
    const room = await this.chatRepository.findRoomByRoomId(chatSeq);
    this.logger.debug(`[ChatRoomService] joinRoomByExUser : ${JSON.stringify(room)}`);
    if (room === null) {
      return false;
    }
    if (room.password) {
      if (password === undefined) {
        return false;
      }
      if (!(await bcrypt.compare(password, room.password))) {
        return false;
      }
    }
    await this.addNormalUsers(chatSeq, [user]);
    return true;
  }

  /**
   * 방의 유형을 가져옵니다. 만약 방이 존재하지 않다면 undefined를 리턴합니다.
   *
   * @param chatSeq 방 식별자
   * @returns 방 유형 or undefined
   */
  async getRoomType(chatSeq: number): Promise<ChatType | undefined> {
    const room = await this.chatRepository.findRoomByRoomId(chatSeq);
    if (room === null) {
      return undefined;
    }
    return room.chatType;
  }

  /**
   * 방을 검색합니다.
   *
   * @param searchKeyword 방 검색 키워드
   * @returns 방 정보
   */
  async searchChatroom(
    searchKeyword: string,
    page: number,
    count: number,
  ): Promise<Array<ChatRoomResultDto>> {
    const chatroomList = await this.chatRepository.searchChatroom(searchKeyword, page, count);
    const participants = await Promise.all(chatroomList.map(
      (chatroom) => this.chatParticipantRepository.getChatParticipantsByRoomid(chatroom.chatSeq),
    ));
    return chatroomList.map((chatroom, index) => ({
      chatSeq: chatroom.chatSeq,
      chatName: chatroom.chatName,
      chatType: chatroom.chatType,
      isPassword: chatroom.password && chatroom.password.length > 0,
      participants: participants[index],
    }));
  }

  /**
   * 방 ID에 대한 방 정보를 가지고 옵니다.
   *
   * @param chatSeq 방 ID
   * @returns 방 정보
   */
  async getRoomInfo(chatSeq: number): Promise<ChatRoomResultDto> {
    const chatroom = await this.chatRepository.findRoomByRoomId(chatSeq);
    const participants = await this.chatParticipantRepository.getChatParticipantsByRoomid(chatSeq);
    return {
      chatSeq: chatroom.chatSeq,
      chatName: chatroom.chatName,
      chatType: chatroom.chatType,
      isPassword: chatroom.password && chatroom.password.length > 0,
      participants,
    };
  }

  /**
   * 특정 방에 특정 유저의 권한을 가져옵니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자
   * @returns 권한
   */
  async getUserAuth(chatSeq: number, user: number): Promise<PartcAuth> {
    const participant = await this.chatParticipantRepository
      .getChatParticipantByUserIdAndRoomId(chatSeq, user);
    return participant.partcAuth;
  }

  /**
   * 특정 방에 특정 유저가 참여하고 있는지 검사합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자
   * @returns 참여 여부
   */
  async isParticipant(chatSeq: number, user: number): Promise<boolean> {
    const participant = await this.chatParticipantRepository
      .getChatParticipantByUserIdAndRoomId(chatSeq, user);
    return participant !== undefined;
  }

  /**
   * 특정 방에 특정 유저의 권한이 방장인지 검사합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자
   * @returns 권한
   */
  async isMaster(chatSeq: number, user: number): Promise<boolean> {
    if (await this.isParticipant(chatSeq, user) === false) {
      return false;
    }
    const participant = await this.getUserAuth(chatSeq, user);
    return participant === PartcAuth.CPAU30;
  }
}
