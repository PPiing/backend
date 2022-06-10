/* eslint-disable */
// NOTE 추후에 데이터베이스 연동시에 해당 옵션을 제거할 것
import Chat from 'src/entities/chat.entity';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import { EntityRepository, Repository } from 'typeorm';
import ChatDto from '../dto/chat.dto';

@EntityRepository(Chat)
export default class ChatRepository extends Repository<Chat> {
  /**
   * 방 ID로 방을 검색합니다. 만약 방이 존재하지 않으면 NULL을 반환합니다.
   *
   * @param chatSeq 방 고유 ID
   * @returns 방 객체 or null
   */
  async findRoomByRoomId(chatSeq: number): Promise<ChatDto | null> {
    return null;
  }

  /**
   * 방 이름으로 방을 검색합니다. 만약 방이 존재하지 않으면 NULL을 반환합니다.
   *
   * @param chatName 방 이름
   * @returns 방 객체 or null
   */
  async findRoomByRoomName(chatName: string): Promise<ChatDto | null> {
    return null;
  }

  /**
   * 방을 추가합니다. 방을 추가하고 나서 방 고유 ID를 반환합니다.
   *
   * @param room 새 방 객체
   * @returns 생성된 방 고유 ID
   */
  async addRoom(room: ChatDto): Promise<number> {
    return 0;
  }

  /**
   * 인자로 주어진 채팅 타입에 속하는 방을 모두 검색합니다.
   *
   * @param chatTypes 채팅 타입 배열
   * @returns 채팅방 객체 배열
   */
  async searchChatroomsByChatType(chatTypes: ChatType[]): Promise<ChatDto[]> {
    return [];
  }

  /**
   * 방을 삭제합니다.
   *
   * @param chatSeq 방 고유 ID
   */
  async deleteRoom(chatSeq: number): Promise<void> {
  }
}
