/* eslint-disable no-restricted-syntax */
// NOTE: 전체적으로 리팩터링 예정
import { Injectable } from '@nestjs/common';

@Injectable()
export default class MessageRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      msgSeq: 0,
      chatSeq: 0,
      partcSeq: 1,
      msg: '안녕하세요',
      createAt: new Date(),
    });
  }

  saveMessages(messages: any[]): any {
    messages.forEach((message) => {
      this.MockEntity.push({
        msgSeq: message.msgSeq, // 실제 테이블에선 Auto Increment한 속성이므로 값을 넣으면 안됨.
        chatSeq: message.chatSeq,
        partcSeq: message.from,
        msg: message.msg,
        createAt: message.createAt,
      });
    });
    return this.MockEntity[this.MockEntity.length - 1];
  }

  getMessages(chatSeq: number, messageId: number, limit: number): any[] {
    const chats = Array.from(this.MockEntity.values()).reverse();
    const filteredChats: any[] = [];
    for (const chat of chats) {
      if (chat.chatSeq === chatSeq && chat.msgSeq < messageId) {
        filteredChats.push(chat);
      }
    }
    return filteredChats.slice(-limit);
  }

  getLastChatIndex(): number {
    return this.MockEntity.length - 1;
  }
}
