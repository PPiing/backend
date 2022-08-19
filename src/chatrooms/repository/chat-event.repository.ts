/* eslint-disable */
// NOTE 추후에 데이터베이스 연동시에 해당 옵션을 제거할 것
import { ChatEvent } from 'src/entities/chat-event.entity';
import EventType from 'src/enums/mastercode/event-type.enum';
import { EntityRepository, Repository } from 'typeorm';
import { ChatEventResultDto } from '../dto/chat-event.dto';

@EntityRepository(ChatEvent)
export default class ChatEventRepository extends Repository<ChatEvent> {
  /**
   * 채팅 이벤트를 저장합니다. 이벤트 타입은 이벤트 타입 열거형에 정의되어 있습니다.
   * 만료 시간이 필요 없을경우 입력하지 않아도 됩니다.
   *
   * @param from 누가
   * @param to 누구에게
   * @param what 무엇을
   * @param where 어느 방에서
   * @param expired 만료 시간
   */
  async saveChatEvent(
    from: number,
    to: number,
    what: EventType,
    where: number,
    expired?: number,
  ): Promise<void> {
    const e = expired ? expired : 0;
    const newChatEvent = new ChatEvent();
    newChatEvent.fromWho = from;
    newChatEvent.toWho = to;
    newChatEvent.eventType = what;
    newChatEvent.chatSeq = where;
    newChatEvent.createdAt = new Date();
    newChatEvent.deletedCheck = false;
    newChatEvent.expiredAt = new Date((new Date()).getTime() + e * 1000);
    this.save(newChatEvent);
  }

  async getBannedList(where: number): Promise<ChatEventResultDto[]> {
    const results = await this.find({
      where: {
        chatSeq: where,
      }
    });
    return results.map(result => ({
      eventSeq: result.eventSeq,
      eventType: result.eventType,
      fromWho: result.fromWho,
      toWho: result.toWho,
      chatSeq: result.chatSeq,
      createdAt: result.createdAt,
      expiredAt: result.expiredAt,
    }));
  }

  /**
   * 채팅 이벤트를 조회합니다. 어느 방에서 누가 당했는지를 조건으로 조회하며 무효처리된 이벤트는 조회하지 않습니다.
   *
   * @param to 누가
   * @param where 어느 방에서
   * @returns ChatEventResultDto 배열
   */
  async getChatEvents(to: number, where: number): Promise<ChatEventResultDto[]> {
    const results = await this.find({
      where: {
        toWho: to,
        chatSeq: where,
      }
    });
    return results.map(result => ({
      eventSeq: result.eventSeq,
      eventType: result.eventType,
      fromWho: result.fromWho,
      toWho: result.toWho,
      chatSeq: result.chatSeq,
      createdAt: result.createdAt,
      expiredAt: result.expiredAt,
    }));
  }

  /**
   * 채팅 이벤트를 삭제합니다.
   *
   * @param eventSeq 채팅 이벤트 PK
   */
  async delChatEvent(eventSeq: number): Promise<void> {
    await this.delete(eventSeq);
  }

  /**
   * 무효처리 되지 않은 모든 채팅 이벤트를 조회합니다.
   *
   * @returns ChatEventResultDto 배열
   */
  async getAllAvailableChatEvents(): Promise<ChatEventResultDto[]> {
    const results = await this.find({
      where: {
        deletedCheck: false,
      }
    });
    return results.map(result => ({
      eventSeq: result.eventSeq,
      eventType: result.eventType,
      fromWho: result.fromWho,
      toWho: result.toWho,
      chatSeq: result.chatSeq,
      createdAt: result.createdAt,
      expiredAt: result.expiredAt,
    }));
  }
}
