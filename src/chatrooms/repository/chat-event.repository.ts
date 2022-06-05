/* eslint-disable no-restricted-syntax */
// NOTE: 전체적으로 리팩터링 예정
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatEventRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      eventSeq: 0,
      eventType: 'MUTE',
      fromWho: 1,
      toWho: 10,
      chatSeq: 0,
      createdAt: new Date(),
      deleteCheck: false,
      expiredAt: new Date((new Date()).getTime() + 60 * 1000),
    });
  }

  async saveChatEvent(
    from: number,
    to: number,
    what: string,
    where: number,
    expired?: number,
  ): Promise<void> {
    let expiredAt = new Date();
    if (expired !== undefined) {
      expiredAt = new Date((new Date()).getTime() + expired * 1000);
    }
    this.MockEntity.push({
      eventSeq: this.MockEntity.length,
      eventType: what,
      fromWho: from,
      toWho: to,
      chatSeq: where,
      createdAt: new Date(),
      deleteCheck: false,
      expiredAt,
    });
  }

  async getChatEvents(to: number, where: number): Promise<any[]> {
    const result = this.MockEntity.filter(
      (v) => v.toWho === to && v.chatSeq === where && v.deleteCheck === false,
    );
    return result;
  }

  async delChatEvent(eventSeq: number): Promise<void> {
    // NOTE 수정 필요
    const result = this.MockEntity.find((v) => v.eventSeq === eventSeq);
    if (result) {
      result.deleteCheck = true;
    }
  }

  async getAllAvailableChatEvents(): Promise<any[]> {
    const result = this.MockEntity.filter((v) => v.deleteCheck === false);
    return result;
  }
}
