/* eslint-disable */
// NOTE 추후에 데이터베이스 연동시에 해당 옵션을 제거할 것
import Message from 'src/entities/message.entity';
import { EntityRepository, Repository } from 'typeorm';
import { MessageDataDto } from '../dto/message-data.dto';

@EntityRepository(Message)
export default class MessageRepository extends Repository<Message> {
  /**
   * 메시지들을 저장합니다.
   *
   * @param messages 메시지 객체들
   */
  async saveMessages(messages: MessageDataDto[]): Promise<void> {
    const newRows = messages.map((msg) => {
      const newMessage = new Message();
      newMessage.message = msg.msg;
      newMessage.createdAt = msg.createAt;
      newMessage.chatSeq = msg.chatSeq;
      newMessage.userSeq = msg.userSeq;
      return newMessage;
    });
    await this.save(newRows);
  }

  /**
   * 인자로 주어진 메시지 ID 이전의 메시지들을 가져옵니다.
   *
   * @param chatSeq 채팅방 고유 ID
   * @param messageId 메시지 ID
   * @param limit 가져올 개수
   * @param blockedUsers 제외할 사용자 ID 목록
   * @returns 메시지 객체들
   */
  async getMessages(chatSeq: number, messageId: number, limit: number, blockedUsers: number[]): Promise<MessageDataDto[]> {
    const query = this.createQueryBuilder('message')
    .where('message.chatSeq = :chatSeq', {
      chatSeq,
    })
    .andWhere('message.msgSeq < :messageId', {
      messageId,
    })
    .limit(limit)
    .orderBy("message.msgSeq", "DESC");
    if (blockedUsers.length > 0) {
      query.andWhere('message.userSeq NOT IN (:...blockedUsers)', {
        blockedUsers,
      });
    }
    const results = await query.getMany();
    return results.map(result => ({
      msgSeq: result.msgSeq,
      chatSeq: result.chatSeq,
      userSeq: result.userSeq,
      msg: result.message,
      createAt: result.createdAt,
    }));
  }

  /**
   * 최신의 메시지 ID를 가져옵니다.
   *
   * @returns 메시지 ID (PK)
   */
  async getLastChatIndex(): Promise<number> {
    const result = await this.findOne({
      order: {
        msgSeq: 'DESC',
      }
    });
    return result.msgSeq;
  }
}
