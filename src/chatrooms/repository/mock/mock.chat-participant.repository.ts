import { ChatParticipantDto } from 'src/chatrooms/dto/chat-participant.dto';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';

/**
 * 채팅방 참가자 mock repository
 * - 0번 채팅방에 유저 10번이 있으며 방장 권한임
 * - 1번 채팅방에 유저 10번이 있으며 방장 권한임
 * - 0번 채팅방에 유저 11번이 있으며 참가자 권한임
 * - 1번 채팅방에 유저 11번이 있으며 부방장 권한임
 */
export default class MockChatParticipantRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      partcSeq: 0,
      userSeq: 10,
      chatSeq: 0,
      partcAuth: PartcAuth.CPAU30,
      enteredAt: new Date(),
      leavedAt: new Date(),
    });
    this.MockEntity.push({
      partcSeq: 1,
      userSeq: 10,
      chatSeq: 1,
      partcAuth: PartcAuth.CPAU30,
      enteredAt: new Date(),
      leavedAt: new Date(),
    });
    this.MockEntity.push({
      partcSeq: 2,
      userSeq: 11,
      chatSeq: 0,
      partcAuth: PartcAuth.CPAU10,
      enteredAt: new Date(),
      leavedAt: new Date(),
    });
    this.MockEntity.push({
      partcSeq: 3,
      userSeq: 11,
      chatSeq: 1,
      partcAuth: PartcAuth.CPAU20,
      enteredAt: new Date(),
      leavedAt: new Date(),
    });
  }

  async saveChatParticipants(userid: number, roomid: number, auth: PartcAuth): Promise<void> {
    this.MockEntity.push({
      partcSeq: this.MockEntity.length,
      userSeq: userid,
      chatSeq: roomid,
      partcAuth: auth,
      enteredAt: new Date(),
      leavedAt: new Date(),
    });
  }

  async getChatParticipantsByRoomid(roomid: number): Promise<ChatParticipantDto[]> {
    return this.MockEntity.filter(
      (participant) => participant.chatSeq === roomid,
    ).map((entity) => ({
      partcSeq: entity.partcSeq,
      userSeq: entity.userSeq,
      chatSeq: entity.chatSeq,
      partcAuth: entity.partcAuth,
      enteredAt: entity.enteredAt,
      leavedAt: entity.leavedAt,
    }));
  }

  async getChatParticipantsByUserid(userid: number): Promise<ChatParticipantDto[]> {
    return this.MockEntity.filter(
      (participant) => participant.userSeq === userid,
    ).map((entity) => ({
      partcSeq: entity.partcSeq,
      userSeq: entity.userSeq,
      chatSeq: entity.chatSeq,
      partcAuth: entity.partcAuth,
      enteredAt: entity.enteredAt,
      leavedAt: entity.leavedAt,
    }));
  }

  async findRoomsByUserId(id: number): Promise<number[]> {
    return this.MockEntity
      .filter((entity) => entity.userSeq === id)
      .map((entity) => entity.chatSeq);
  }

  async getChatParticipantByUserIdAndRoomId(
    chatSeq: number,
    userId: number,
  ): Promise<ChatParticipantDto | undefined> {
    return this.MockEntity.find(
      (entity) => entity.userSeq === userId && entity.chatSeq === chatSeq,
    );
  }

  async addUsers(chatSeq: number, users: number[]): Promise<void> {
    let counter = this.MockEntity.length - 1;
    const insert = users.map((user) => {
      counter += 1;
      return {
        partcSeq: counter,
        userSeq: user,
        chatSeq,
        partcAuth: PartcAuth.CPAU10,
        enteredAt: new Date(),
        leavedAt: new Date(),
      };
    });
    this.MockEntity.push(...insert);
  }

  async changeUserAuth(chatSeq: number, user: number, partcAuth: PartcAuth): Promise<void> {
    const entity = this.MockEntity.find(
      (e) => e.chatSeq === chatSeq && e.userSeq === user,
    );
    if (entity) {
      entity.partcAuth = partcAuth;
    }
  }

  async removeUser(chatSeq: number, user: number): Promise<boolean> {
    const entity = this.MockEntity.find(
      (e) => e.chatSeq === chatSeq && e.userSeq === user,
    );
    if (entity) {
      this.MockEntity = this.MockEntity.filter(
        (e) => !(e.chatSeq === chatSeq && e.userSeq === user),
      );
      return true;
    }
    return false;
  }
}
