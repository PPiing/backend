import { ChatEventResultDto } from 'src/chatrooms/dto/chat-event.dto';
import EventType from 'src/enums/mastercode/event-type.enum';
/**
 * 채팅방 이벤트 mock repository
 * - 0번 채팅방에서 유저 10번이 유저 1번에게 1분동안 뮤트 당함
 * - 1번 채팅방에서 유저 11번이 유저 10번에게 5분동안 뮤트 당함
 * - 2번 채팅방에서 유저 11번이 유저 10번에게 밴 당함
 */
export default class MockChatEventRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      eventSeq: 0,
      eventType: EventType.EVST30,
      fromWho: 1,
      toWho: 10,
      chatSeq: 0,
      createdAt: new Date(),
      deleteCheck: false,
      expiredAt: new Date((new Date()).getTime() + 60 * 1000),
    });
    this.MockEntity.push({
      eventSeq: 1,
      eventType: EventType.EVST30,
      fromWho: 10,
      toWho: 11,
      chatSeq: 1,
      createdAt: new Date(),
      deleteCheck: false,
      expiredAt: new Date((new Date()).getTime() + 5 * 60 * 1000),
    });
    this.MockEntity.push({
      eventSeq: 2,
      eventType: EventType.EVST20,
      fromWho: 10,
      toWho: 11,
      chatSeq: 2,
      createdAt: new Date(),
      deleteCheck: false,
      expiredAt: new Date(),
    });
  }

  async saveChatEvent(
    from: number,
    to: number,
    what: EventType,
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

  async getChatEvents(to: number, where: number): Promise<ChatEventResultDto[]> {
    const result = this.MockEntity.filter(
      (v) => v.toWho === to && v.chatSeq === where && v.deleteCheck === false,
    ).map((v) => ({
      eventSeq: v.eventSeq,
      eventType: v.eventType,
      fromWho: v.fromWho,
      toWho: v.toWho,
      chatSeq: v.chatSeq,
      createdAt: v.createdAt,
      expiredAt: v.expiredAt,
    }));
    return result;
  }

  async delChatEvent(eventSeq: number): Promise<void> {
    // NOTE 수정 필요
    const result = this.MockEntity.find((v) => v.eventSeq === eventSeq);
    if (result) {
      result.deleteCheck = true;
    }
  }

  async getAllAvailableChatEvents(): Promise<ChatEventResultDto[]> {
    const result = this.MockEntity.filter((v) => v.deleteCheck === false)
      .map((v) => ({
        eventSeq: v.eventSeq,
        eventType: v.eventType,
        fromWho: v.fromWho,
        toWho: v.toWho,
        chatSeq: v.chatSeq,
        createdAt: v.createdAt,
        expiredAt: v.expiredAt,
      }));
    return result;
  }
}
