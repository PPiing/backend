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
      userSeq: 1,
      chatSeq: 0,
      partcAuth: PartcAuth.CPAU10,
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

  addUser(chatSeq: number, users: number[]): boolean {
    const insert = users.map((user) => ({
      partcSeq: this.MockEntity.length,
      userSeq: user,
      chatSeq,
      partcAuth: PartcAuth.CPAU10,
      mutedUntil: new Date(),
      isBaned: false,
      enteredAt: new Date(),
      leavedAt: new Date(),
    }));
    this.MockEntity.push(...insert);
    return true;
  }

  removeUser(chatSeq: number, user: number): boolean {
    this.MockEntity = this.MockEntity.filter(
      (entity) => entity.chatSeq !== chatSeq && entity.userSeq !== user,
    );
    return true;
  }
}
