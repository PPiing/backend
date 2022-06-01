/* eslint-disable no-restricted-syntax */
// NOTE: 전체적으로 리팩터링 예정
import { Injectable } from '@nestjs/common';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import { ChatParticipantDto } from './dto/chat-participant.dto';

@Injectable()
export default class ChatParticipantRepository {
  MockEntity: ChatParticipantDto[] = [];

  constructor() {
    this.MockEntity.push({
      partcSeq: 0,
      userSeq: 10,
      chatSeq: 0,
      partcAuth: PartcAuth.CPAU30,
      mutedUntil: new Date(),
      isBaned: false,
      enteredAt: new Date(),
      leavedAt: new Date(),
    });
  }

  saveChatParticipants(userid: number, roomid: number, auth: PartcAuth): any {
    this.MockEntity.push({
      partcSeq: this.MockEntity.length, // 실제 테이블에선 Auto Increment한 속성이므로 값을 넣으면 안됨.
      userSeq: userid,
      chatSeq: roomid,
      partcAuth: auth,
      mutedUntil: new Date(),
      isBaned: false,
      enteredAt: new Date(),
      leavedAt: new Date(),
    });
  }

  async getChatParticipantsByRoomid(roomid: number): Promise<any> {
    return this.MockEntity.filter(
      (participant) => participant.chatSeq === roomid,
    );
  }

  async getChatParticipantsByUserid(userid: number): Promise<any> {
    return this.MockEntity.filter(
      (participant) => participant.userSeq === userid,
    );
  }

  findRoomsByUserId(id: number): number[] {
    return this.MockEntity
      .filter((entity) => entity.userSeq === id)
      .map((entity) => entity.chatSeq);
  }

  async banUser(chatSeq: number, user: number): Promise<boolean> {
    const entity = this.MockEntity.find(
      (e) => e.chatSeq === chatSeq && e.userSeq === user,
    );
    if (entity) {
      entity.isBaned = true;
      return true;
    }
    return false;
  }

  async unbanUser(chatSeq: number, user: number): Promise<boolean> {
    const entity = this.MockEntity.find(
      (e) => e.chatSeq === chatSeq && e.userSeq === user,
    );
    if (entity) {
      entity.isBaned = false;
      return true;
    }
    return false;
  }

  async muteUser(chatSeq: number, user: number, mutedUntil: Date): Promise<boolean> {
    const entity = this.MockEntity.find(
      (e) => e.chatSeq === chatSeq && e.userSeq === user,
    );
    if (entity) {
      entity.mutedUntil = mutedUntil;
      return true;
    }
    return false;
  }

  async unmuteUser(chatSeq: number, user: number): Promise<boolean> {
    const entity = this.MockEntity.find(
      (e) => e.chatSeq === chatSeq && e.userSeq === user,
    );
    if (entity) {
      entity.mutedUntil = new Date();
      return true;
    }
    return false;
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
        mutedUntil: new Date(),
        isBaned: false,
        enteredAt: new Date(),
        leavedAt: new Date(),
      };
    });
    this.MockEntity.push(...insert);
  }

  async changeUserAuth(chatSeq: number, user: number, partcAuth: PartcAuth): Promise<boolean> {
    const entity = this.MockEntity.find(
      (e) => e.chatSeq === chatSeq && e.userSeq === user,
    );
    if (entity) {
      entity.partcAuth = partcAuth;
      return true;
    }
    return false;
  }

  removeUser(chatSeq: number, user: number): boolean {
    this.MockEntity = this.MockEntity.filter(
      (entity) => !(entity.chatSeq === chatSeq && entity.userSeq === user),
    );
    return true;
  }
}
