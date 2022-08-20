import {
  BadRequestException,
  CACHE_MANAGER, Inject, Injectable, Logger, OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import EventType from 'src/enums/mastercode/event-type.enum';
import ChatParticipantRepository from './repository/chat-participant.repository';
import ChatRepository from './repository/chat.repository';
import { MessageDataDto } from './dto/message-data.dto';
import MessageRepository from './repository/message.repository';
import ChatEventRepository from './repository/chat-event.repository';
import FriendsRepository from './repository/friends.repository';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export default class ChatroomsService implements OnModuleInit {
  private readonly logger = new Logger(ChatroomsService.name);

  constructor(
    private chatRepository: ChatRepository,
    private messageRepository: MessageRepository,
    private chatParticipantRepository: ChatParticipantRepository,
    private chatEventRepository: ChatEventRepository,
    private schedulerRegistry: SchedulerRegistry,
    private friendsRepository: FriendsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * 서비스 모듈이 초기화될 때 실행됩니다.
   * 비동기 함수로 실행해야 하고 다른 모듈들도 초기화 된 후 실행해야 하기 때문에 생성자를 사용하지 않았습니다.
   */
  async onModuleInit() {
    await this.muteStopper();
    await this.setInitMutedUsers();
    await this.setInitBlockedUsers();
  }

  /**
   * nestjs의 캐시 매니저와 스케줄러를 이용해 Inline Cache의 Write-Behind를 구현합니다.
   * 매분 정각에 해당 코드를 실행합니다.
   */
  @Cron('0 * * * * *')
  async writeBehind(): Promise<void> {
    const chatCache: undefined | Array<MessageDataDto> = await this.cacheManager.get('chat');
    const chatIndex: undefined | number = await this.cacheManager.get('chat_index');
    await this.cacheManager.set('chat_index', chatIndex);
    if (chatCache !== undefined && chatIndex !== undefined) {
      const len = chatCache.length;
      this.logger.debug(`DB에 저장된 채팅 메시지 수: ${len}`);
      await this.messageRepository.saveMessages(chatCache);
      await this.cacheManager.del('chat');
    }
  }

  /**
   * 뮤트가 만료된 사용자를 찾아 채팅방에서 뮤트를 해제하는 콜백함수입니다.
   * 클래스의 컨텍스트를 가져가기 위해 화살표 함수로 선언하였습니다.
   */
  muteStopper = async () => {
    this.logger.debug('exec muteStopper');
    const timeout = this.schedulerRegistry.doesExist('timeout', 'muteStopper');
    if (timeout) {
      this.schedulerRegistry.deleteTimeout('muteStopper');
    }
    const getRemainTimeSec = (t1: Date, t2: Date): number => (t1.getTime() - t2.getTime()) / 1000;
    const muted = (await this.chatEventRepository.getAllAvailableChatEvents())
      .filter((chatEvent) => chatEvent.eventType === EventType.EVST30)
      .sort((a, b) => a.expiredAt.getTime() - b.expiredAt.getTime());
    const now = new Date();
    const stop = [];
    const nextTime = muted.find((chatEvent) => {
      if (getRemainTimeSec(chatEvent.expiredAt, now) < 0) {
        stop.push(chatEvent.chatSeq);
        return false;
      }
      return true;
    });
    const stopJob = stop.map((chatSeq) => this.chatEventRepository.delChatEvent(chatSeq));
    await Promise.all(stopJob);
    if (nextTime !== undefined) {
      this.logger.debug('add muteStopper');
      this.schedulerRegistry.addTimeout(
        'muteStopper',
        setTimeout(
          this.muteStopper,
          getRemainTimeSec(nextTime.expiredAt, now) * 1000,
        ),
      );
    }
  };

  /**
   * 앱 처음 실행시 기존 DB에 저장된 Mute 처리된 유저들을 조회해 캐시에 저장합니다.
   */
  async setInitMutedUsers(): Promise<void> {
    const getRemainTimeSec = (t1: Date, t2: Date): number => (t1.getTime() - t2.getTime()) / 1000;
    const now = new Date();
    const muted = (await this.chatEventRepository.getAllAvailableChatEvents())
      .filter((chatEvent) => chatEvent.eventType === EventType.EVST30);
    muted.forEach(async (chatEvent) => {
      const ttl = getRemainTimeSec(chatEvent.expiredAt, now);
      const key = `${chatEvent.chatSeq}-${chatEvent.toWho}-mute`;
      await this.cacheManager.set(key, chatEvent.expiredAt, { ttl });
    });
  }

  /**
   * 앱 처음 실행시 기존 DB에 저장된 Block 처리된 유저들을 조회해 캐시에 저장합니다.
   * from이 to를 차단한 관계입니다.
   */
  async setInitBlockedUsers(): Promise<void> {
    const blocked = await this.friendsRepository.getAllBlockedFriends();
    const tmp = new Map<string, Set<number>>();
    blocked.forEach((friend) => {
      const key = `${friend.to}-block`;
      if (tmp.has(key)) {
        tmp.get(key).add(friend.from);
      } else {
        tmp.set(key, new Set<number>([friend.from]));
      }
    });
    tmp.forEach(async (value, key) => {
      await this.cacheManager.set(key.toString(), value);
    });
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
    reqUserSeq: number,
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
      // const blockedUsers = await this.friendsRepository.blockedUsers(reqUserSeq);
      const blockedUsers = [];
      filteredChats = await this.messageRepository.getMessages(
        chatSeq,
        newMsgSeq,
        limitCnt,
        blockedUsers,
      );
    } else {
      for (let index = cache.length - 1; index >= 0; index -= 1) {
        // NOTE: 다음 커밋시점에서 수정예정
        /* eslint-disable no-await-in-loop */
        const isBlockedUser = await this.friendsRepository.blocked({
          from: reqUserSeq,
          to: cache[index].userSeq,
        });
        if (cache[index].chatSeq === chatSeq
          && cache[index].msgSeq < newMsgSeq
          && limitCnt !== 0
          && !isBlockedUser
        ) {
          filteredChats.push(cache[index]);
          limitCnt -= 1;
        }
      }
      if (limitCnt !== 0) {
        const blockedUsers = await this.friendsRepository.blockedUsers(reqUserSeq);
        const dbrtn = await this.messageRepository.getMessages(
          chatSeq,
          newMsgSeq,
          limitCnt,
          blockedUsers,
        );
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
      userSeq: chat.userSeq,
      chatSeq: chat.chatSeq,
      msg: chat.msg,
      createAt: chat.createAt,
    };
    await this.cacheManager.set('chat_index', chatIndex + 1);
    const chatCache: undefined | Array<MessageDataDto> = await this.cacheManager.get('chat');
    if (chatCache === undefined) {
      await this.cacheManager.set('chat', [chatData]);
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
      userSeq: from,
      chatSeq,
      msg,
      createAt: new Date(),
    });
  }

  /**
   * 유저들이 존재하는지 확인합니다.
   * 추후에 DB에서 조회하는 것으로 변경해야 합니다.
   *
   * @param users 유저 배열
   * @returns 유저가 존재하는지 여부 (한명이라도 존재하지 않으면 false 리턴)
   */
  async existUsers(users: Array<number>): Promise<boolean> {
    // TODO 추후에 await this.userRepository.existUser(user); 과 같은 형태로 판단해야함
    const find = users.find((user) => user < 0);
    return find === undefined;
  }

  /**
   * 방들이 존재하는지 확인합니다.
   *
   * @param rooms 방 배열
   * @returns 방이 존재하는지 여부 (하나라도 존재하지 않으면 false 리턴)
   */
  async existRooms(rooms: Array<number>): Promise<boolean> {
    const roomSearchList = await Promise.all(
      rooms.map((room) => this.chatRepository.findRoomByRoomId(room)),
    );
    const find = roomSearchList.find((room) => room === null);
    return find === undefined;
  }

  /**
   * 유저들 중 하나라도 존재하지 않으면 에러를 발생시킵니다.
   *
   * @param users 유저 배열
   * @throws 유저가 존재하지 않는 경우
   */
  async checkUsers(users: Array<number>): Promise<void> {
    const existUsers = await this.existUsers(users);
    if (!existUsers) {
      throw new BadRequestException('존재하지 않는 유저입니다.');
    }
  }

  /**
   * 방들 중 하나라도 존재하지 않으면 에러를 발생시킵니다.
   *
   * @param rooms 방 배열
   * @throws 방이 존재하지 않는 경우
   */
  async checkRooms(rooms: Array<number>): Promise<void> {
    const existRooms = await this.existRooms(rooms);
    if (!existRooms) {
      throw new BadRequestException('존재하지 않는 방입니다.');
    }
  }

  /**
   * 특정 방의 특정 메시지 이전의 채팅을 limit만큼 가져옵니다.
   *
   * @param chatSeq 방 ID
   * @param messageId 메시지 ID
   * @param limit 제한
   * @param reqUserSeq 요청자 ID
   * @returns 채팅 배열
   */
  async getMessages(
    chatSeq: number,
    messageId: number,
    limit: number,
    reqUserSeq: number,
  ): Promise<Array<MessageDataDto>> {
    const rtn = await this.cacheChatRead(chatSeq, messageId, limit, reqUserSeq);
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
   * 접속한 클라이언트 소켓을 소속되어 있는 모든 룸에 추가하고 소속된 룸을 반환합니다.
   *
   * @param user 클라이언트 소켓
   * @param username 클라이언트 식별자
   * @returns 소속된 룸 목록
   */
  async roomJoin(user: Socket, username: number): Promise<number[]> {
    const rooms = await this.chatParticipantRepository.findRoomsByUserId(username);
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
  async roomLeave(user: Socket, userID: number): Promise<void> {
    const rooms = await this.chatParticipantRepository.findRoomsByUserId(userID);
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
  async addRoom(create: ChatRequestDto): Promise<number> {
    if (await this.chatRepository.findRoomByRoomName(create.chatName)) {
      throw new BadRequestException('방제목이 중복되었습니다.');
    }
    if (create.chatType === ChatType.CHTP10) {
      throw new BadRequestException('방 타입이 잘못되었습니다.');
    }
    if (create.chatType !== ChatType.CHTP30 && !!create.password) {
      throw new BadRequestException('비밀번호가 걸린 방이 아닌 경우 비밀번호는 입력할 수 없습니다.');
    }
    if (create.chatType === ChatType.CHTP30 && !create.password) {
      throw new BadRequestException('비밀번호가 걸린 방을 만들고자 할 때에는 비밀번호를 입력해야 합니다.');
    }
    const hashPassword = create.password ? await bcrypt.hash(create.password, 10) : '';
    const hashed = {
      ...create,
      password: hashPassword,
    };
    this.logger.debug(`[ChatRoomService] addRoom : ${JSON.stringify(hashed)}`);
    return this.chatRepository.addRoom(hashed);
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
    if ((await this.chatRepository.findRoomByRoomName(`DM-${user1}-${user2}`))
     || (await this.chatRepository.findRoomByRoomName(`DM-${user2}-${user1}`))) {
      throw new BadRequestException('이미 존재하는 DM입니다.');
    }
    // TODO 유저 ID가 올바른지 검증 필요 - 외부에서 처리
    const chatName = `DM-${user1}-${user2}`;
    const newRoom = {
      chatName,
      chatType: ChatType.CHTP10,
      password: '',
      isDirected: true,
    };
    this.logger.debug(`[ChatRoomService] addDM : ${JSON.stringify(newRoom)}`);
    return this.chatRepository.addRoom(newRoom);
  }

  /**
   * 특정 방에 일반 사용자들을 추가합니다.
   *
   * @param chatSeq 방 식별자
   * @param users 추가할 사용자 고유 ID 목록
   * @returns 사용자 식별자 리스트
   */
  async addNormalUsers(chatSeq: number, users: number[]): Promise<void> {
    const roomParticipants = await this.chatParticipantRepository
      .getChatParticipantsByRoomid(chatSeq);
    const check = roomParticipants.find((participant) => users.includes(participant.userSeq));
    if (check !== undefined) {
      throw new BadRequestException('이미 존재하는 사용자를 추가하려고 합니다.');
    }
    await this.chatParticipantRepository.addUsers(chatSeq, users);
  }

  /**
   * 방에 사용자를 추가하고 방을 만든 사람을 방장으로 지정합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 방장 고유 ID
   */
  async addOwner(chatSeq: number, user: number): Promise<void> {
    const check = await this.chatParticipantRepository
      .getChatParticipantByUserIdAndRoomId(chatSeq, user);
    if (check !== undefined) {
      throw new BadRequestException('이미 존재하는 사용자를 추가하려고 합니다.');
    }
    await this.chatParticipantRepository.addUsers(chatSeq, [user]);
    await this.chatParticipantRepository.changeUserAuth(chatSeq, user, PartcAuth.CPAU30);
  }

  /**
   * 방의 특정 유저를 방장으로 임명합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 임명할 유저 고유 ID
   */
  async setAdmin(chatSeq: number, user: number): Promise<void> {
    await this.chatParticipantRepository.changeUserAuth(chatSeq, user, PartcAuth.CPAU30);
  }

  /**
   * 방의 특정 유저를 매니저로 임명합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 임명할 유저 고유 ID
   */
  async setManager(chatSeq: number, user: number): Promise<void> {
    await this.chatParticipantRepository.changeUserAuth(chatSeq, user, PartcAuth.CPAU20);
  }

  /**
   * 방의 특정 유저를 일반 유저로 임명합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 임명할 유저 고유 ID
   */
  async setNormalUser(chatSeq: number, user: number): Promise<void> {
    await this.chatParticipantRepository.changeUserAuth(chatSeq, user, PartcAuth.CPAU10);
  }

  /**
   * 특정 방에 클라이언트 입장 여부를 이벤트에 기록합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자
   */
  async userInSave(chatSeq: number, user: number): Promise<void> {
    await this.chatEventRepository.saveChatEvent(user, user, EventType.EVST40, chatSeq);
  }

  /**
   * 특정 방에 클라이언트 퇴장 여부를 이벤트에 기록합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자
   */
  async userOutSave(chatSeq: number, user: number): Promise<void> {
    await this.chatEventRepository.saveChatEvent(user, user, EventType.EVST45, chatSeq);
  }

  /**
   * 특정 방에서 사용자를 제거합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 제거할 사용자 식별자
   * @returns 제거 성공 여부
   */
  async leftUser(chatSeq: any, user: any): Promise<boolean> {
    const exist = await this.isParticipant(chatSeq, user);
    if (exist) {
      return this.chatParticipantRepository.removeUser(chatSeq, user);
    }
    return exist;
  }

  /**
   * 특정 방에서 사용자를 킥할때 해당 내용을 DB에 저장합니다.
   *
   * @param chatSeq 방 식별자
   * @param to 킥할 사용자 식별자
   * @param admin 킥하는 관리자 식별자
   */
  async kickUserSave(chatSeq: number, to: number, admin: number): Promise<void> {
    await this.chatEventRepository.saveChatEvent(admin, to, EventType.EVST10, chatSeq);
  }

  /**
   * 특정 방에서 사용자를 밴합니다.
   *
   * @param chatSeq 방 식별자
   * @param to 밴할 사용자 식별자
   * @param admin 밴하는 관리자 식별자
   * @returns 밴 성공 여부
   */
  async banUser(chatSeq: number, to: number, admin: number): Promise<boolean> {
    if (!(await this.leftUser(chatSeq, to))) {
      return false;
    }
    if (await this.isBanned(chatSeq, to)) {
      return false;
    }
    await this.chatEventRepository.saveChatEvent(admin, to, EventType.EVST20, chatSeq);
    return true;
  }

  /**
   * 특정 방의 특정 유저가 밴당했는지 확인합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 밴 확인할 유저 식별자
   * @returns 밴 여부
   */
  async isBanned(chatSeq: number, user: number): Promise<boolean> {
    const find = (await this.chatEventRepository.getChatEvents(user, chatSeq))
      .find((chatEvent) => chatEvent.eventType === EventType.EVST20);
    this.logger.debug(`[ChatRoomService] isBanned : ${JSON.stringify(find)}`);
    return find !== undefined;
  }

  async bannedUserList(chatSeq: number): Promise<number[]> {
    const banned = await this.chatEventRepository.getBannedList(chatSeq);
    const result = [];
    for (let index = 0; index < banned.length; index += 1) {
      if (banned[index].eventType === EventType.EVST20) {
        result.push(banned[index].toWho);
      }
    }
    return result;
  }

  /**
   * 밴당한 유저를 해제합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 해제할 유저 식별자
   */
  async unbanUser(chatSeq: number, user: number): Promise<void> {
    const find = (await this.chatEventRepository.getChatEvents(user, chatSeq))
      .find((chatEvent) => chatEvent.eventType === EventType.EVST20);
    await this.chatEventRepository.delChatEvent(find.eventSeq);
  }

  /**
   * 특정 사용자를 뮤트합니다.
   *
   * @param chatSeq 방 식별자
   * @param to 뮤트할 사용자 식별자
   * @param admin 뮤트시키는 사용자 식별자
   * @param time 뮤트시킬 시간
   */
  async muteUser(chatSeq: number, to: number, admin: number, time: number): Promise<void> {
    const expiredAt = new Date((new Date()).getTime() + time * 1000);
    await this.chatEventRepository.saveChatEvent(admin, to, EventType.EVST30, chatSeq, time);
    const key = `${chatSeq}-${to}-mute`;
    await this.cacheManager.set(key, expiredAt, { ttl: time });
    await this.muteStopper();
  }

  /**
   * 특정 사용자에 대해 뮤트 해제합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 뮤트 해제할 사용자 식별자
   * @returns 뮤트 해제 성공 여부
   */
  async unmuteUser(chatSeq: number, user: number): Promise<boolean> {
    const find = (await this.chatEventRepository.getChatEvents(user, chatSeq))
      .find((chatEvent) => chatEvent.eventType === EventType.EVST30);
    if (find !== undefined) {
      await this.chatEventRepository.delChatEvent(find.chatSeq);
      const key = `${chatSeq}-${user}-mute`;
      await this.cacheManager.del(key);
      return true;
    }
    return false;
  }

  /**
   * 특정 방의 특정 유저가 뮤트당했는지 확인합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 뮤트 확인할 유저 식별자
   * @returns 뮤트 풀리는 시간 (뮤트되지 않았으면 0)
   */
  async isMuted(chatSeq: any, user: any): Promise<number> {
    const key = `${chatSeq}-${user}-mute`;
    const now = new Date();
    const getRemainTimeSec = (t1: Date, t2: Date): number => (t1.getTime() - t2.getTime()) / 1000;
    const until: undefined | Date = await this.cacheManager.get(key);
    if (until === undefined) {
      return 0;
    }
    const rtn = Math.floor(getRemainTimeSec(until, now));
    if (rtn < 0) {
      return 0;
    }
    return rtn;
  }

  /**
   * 특정 유저를 차단한 유저 셋을 가져옵니다.
   *
   * @param user 차단당한 유저 식별자
   * @returns 차단한 유저 셋
   */
  async getBlockedUsers(user: number): Promise<Set<number>> {
    const key = `${user}-block`;
    const blockedUsers: Set<number> | undefined = await this.cacheManager.get(key);
    if (blockedUsers === undefined) {
      return new Set();
    }
    return blockedUsers;
  }

  /**
   * 현재 소켓 접속한 유저 중 특정 룸에서 인자로 입력된 유저를 차단한 유저의 소켓 ID를 리턴합니다.
   *
   * @param user 차단당한 유저 식별자
   * @param server 서버 소켓 객체
   * @returns 차단한 유저 식별자 리스트
   */
  async getBlockedSocketIdList(user: number, room: number, server: Server): Promise<string[]> {
    const clientList = await server.in(room.toString()).fetchSockets();
    const blockList = await this.getBlockedUsers(user);
    const rtn = [];
    const promiseUserIdList = clientList.map(
      (socket) => this.whoAmI(socket.id),
    );
    const userIdList = await Promise.all(promiseUserIdList);
    userIdList.forEach((userId, index) => {
      if (blockList.has(userId)) {
        rtn.push(clientList[index].id);
      }
    });
    return rtn;
  }

  /**
   * 특정 유저를 차단합니다.
   *
   * @param user 유저 식별자
   * @param willBlockUser 차단할 유저 식별자
   * @returns 차단 성공 여부
   */
  async blockUser(user: number, willBlockUser: number): Promise<boolean> {
    const key = `${willBlockUser}-block`;
    const blockedUsers = await this.getBlockedUsers(willBlockUser);
    if (blockedUsers.has(user)) {
      return false;
    }
    blockedUsers.add(user);
    await this.cacheManager.set(key, blockedUsers);
    await this.friendsRepository.setBlock({
      from: user,
      to: willBlockUser,
    });
    return true;
  }

  /**
   * 특정 유저가 차단한 유저에 대해 차단을 해제합니다.
   *
   * @param user 유저 식별자
   * @param blockedUser 차단 해제할 유저 식별자
   * @returns 차단 해제 성공 여부
   */
  async unblockUser(user: number, blockedUser: number): Promise<boolean> {
    const key = `${blockedUser}-block`;
    const blockedUsers: Set<number> | undefined = await this.cacheManager.get(key);
    if (blockedUsers === undefined || !blockedUsers.has(user)) {
      return false;
    }
    blockedUsers.delete(user);
    await this.cacheManager.set(key, blockedUsers);
    await this.friendsRepository.setUnblock({
      from: user,
      to: blockedUser,
    });
    return true;
  }

  /**
   * 소켓 고유 ID를 이용해 실사용자의 ID를 가져옵니다.
   *
   * @param user 클라이언트 소켓 ID
   * @returns 사용자 ID
   */
  async whoAmI(user: string): Promise<number> {
    return this.cacheManager.get(user);
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
   * 공개방, 비밀번호 걸린 방을 가지고 옵니다.
   *
   * @returns 공개방, 비밀번호 걸린 방 목록
   */
  async searchChatroom(): Promise<Array<ChatResponseDto>> {
    const chatroomList = await this.chatRepository.searchChatroomsByChatType([
      ChatType.CHTP20,
      ChatType.CHTP30,
    ]);

    const promiseChatParticipantsList = chatroomList.map(
      (room) => this.chatParticipantRepository.getChatParticipantsByRoomid(room.chatSeq),
    );
    const chatParticipantsList = await Promise.all(promiseChatParticipantsList);

    const rtn: ChatResponseDto[] = chatroomList.map((room, idx) => ({
      chatSeq: room.chatSeq,
      chatName: room.chatName,
      chatType: room.chatType,
      isPassword: room.password !== undefined,
      participants: chatParticipantsList[idx],
    }));
    return rtn;
  }

  /**
   * 방 ID에 대한 방 정보를 가지고 옵니다.
   *
   * @param chatSeq 방 ID
   * @returns 방 정보
   */
  async getRoomInfo(chatSeq: number): Promise<ChatResponseDto> {
    const chatroom = await this.chatRepository.findRoomByRoomId(chatSeq);
    const participants = await this.chatParticipantRepository.getChatParticipantsByRoomid(chatSeq);
    return {
      chatSeq: chatroom.chatSeq,
      chatName: chatroom.chatName,
      chatType: chatroom.chatType,
      isPassword: chatroom.password.length > 0,
      participants,
    };
  }

  /**
   * 방의 인원이 몇명인지 가져옵니다.
   *
   * @param chatSeq 방 ID
   * @returns 방 인원 수
   */
  async getRoomParticipantsCount(chatSeq: number): Promise<number> {
    const participants = await this.chatParticipantRepository.getChatParticipantsByRoomid(chatSeq);
    return participants.length;
  }

  /**
   * 방을 지웁니다.
   *
   * @param chatSeq 방 ID
   */
  async deleteRoom(chatSeq: number): Promise<void> {
    await this.chatRepository.deleteRoom(chatSeq);
  }

  /**
   * 관리자가 사라질 경우 다음 관리자를 지명합니다.
   * 매니저가 있는 방이라면 매니저에게 우선권을 부여하며 매니저가 없는 방이라면 일반 유저를 매니저로 지정합니다.
   *
   * @param chatSeq 방 ID
   * @returns 다음 관리자 식별자 (실패하면 -1)
   */
  async getNextAdmin(chatSeq: number): Promise<number> {
    const participants = await this.chatParticipantRepository.getChatParticipantsByRoomid(chatSeq);
    const manager = participants.find((user) => user.partcAuth === PartcAuth.CPAU20);
    if (manager) {
      return manager.userSeq;
    }
    const normalUser = participants.find((user) => user.partcAuth === PartcAuth.CPAU10);
    if (normalUser) {
      return normalUser.userSeq;
    }
    return -1;
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

  /**
   * 특정 방에 특정 유저의 권한이 매니저인지 검사합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자
   * @returns 권한
   */
  async isManager(chatSeq: number, user: number): Promise<boolean> {
    if (await this.isParticipant(chatSeq, user) === false) {
      return false;
    }
    const participant = await this.getUserAuth(chatSeq, user);
    return participant === PartcAuth.CPAU20;
  }

  /**
   * 특정 방에 특정 유저의 권한이 일반 유저인지 검사합니다.
   *
   * @param chatSeq 방 식별자
   * @param user 사용자 식별자
   * @returns 권한
   */
  async isNormalUser(chatSeq: number, user: number): Promise<boolean> {
    if (await this.isParticipant(chatSeq, user) === false) {
      return false;
    }
    const participant = await this.getUserAuth(chatSeq, user);
    return participant === PartcAuth.CPAU10;
  }

  /**
   * 방 정보를 변경합니다.
   *
   * @param roomId 방 식별자
   * @param roomInfo 변경될 방 정보
   */
  async updateRoom(roomId: number, roomInfo: UpdateRoomDto) {
    await this.chatRepository.updateRoom(roomId, roomInfo);
  }
}
