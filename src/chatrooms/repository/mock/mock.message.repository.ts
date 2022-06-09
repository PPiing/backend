import { MessageDataDto } from 'src/chatrooms/dto/message-data.dto';

/**
 * 메시지 mock repository
 * - 10번 유저가 0번 채팅방에서 "안녕하세요"
 */
export default class MockMessageRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      msgSeq: 0,
      chatSeq: 0,
      userSeq: 10,
      msg: '안녕하세요',
      createAt: new Date(),
    });
  }

  async saveMessages(messages: any[]): Promise<void> {
    messages.forEach((message) => {
      this.MockEntity.push({
        msgSeq: message.msgSeq, // 실제 테이블에선 Auto Increment한 속성이므로 값을 넣으면 안됨.
        chatSeq: message.chatSeq,
        userSeq: message.userSeq,
        msg: message.msg,
        createAt: message.createAt,
      });
    });
  }

  async getMessages(
    chatSeq: number,
    messageId: number,
    limit: number,
    blockedUsers: number[],
  ): Promise<MessageDataDto[]> {
    const chats = Array.from(this.MockEntity.values()).reverse();
    const filteredChats: MessageDataDto[] = [];
    chats.forEach((chat) => {
      if (chat.chatSeq === chatSeq
        && chat.msgSeq < messageId
        && !blockedUsers.includes(chat.userSeq)) {
        filteredChats.push(chat);
      }
    });
    return filteredChats.slice(-limit);
  }

  async getLastChatIndex(): Promise<number> {
    return this.MockEntity.length - 1;
  }
}
