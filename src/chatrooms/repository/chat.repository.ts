/* eslint-disable */
// NOTE 추후에 데이터베이스 연동시에 해당 옵션을 제거할 것
import Chat from 'src/entities/chat.entity';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import { EntityRepository, Repository } from 'typeorm';
import ChatDto from '../dto/chat.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';

@EntityRepository(Chat)
export default class ChatRepository extends Repository<Chat> {
  /**
   * 방 ID로 방을 검색합니다. 만약 방이 존재하지 않으면 NULL을 반환합니다.
   *
   * @param chatSeq 방 고유 ID
   * @returns 방 객체 or null
   */
  async findRoomByRoomId(chatSeq: number): Promise<ChatDto | null> {
    const result = await this.findOne(chatSeq);
    if (result === null || result === undefined) {
      return null;
    }
    return ({
      chatSeq: result.chatSeq,
      chatType: result.chatType,
      chatName: result.chatName,
      password: result.password,
      isDirected: result.isDirected,
    });
  }

  /**
   * 방 이름으로 방을 검색합니다. 만약 방이 존재하지 않으면 NULL을 반환합니다.
   *
   * @param chatName 방 이름
   * @returns 방 객체 or null
   */
  async findRoomByRoomName(chatName: string): Promise<ChatDto | null> {
    const result = await this.find({
      where: {
        chatName,
      }
    });
    if (result === null || result === undefined || result.length === 0) {
      return null;
    }
    return ({
      chatSeq: result[0].chatSeq,
      chatType: result[0].chatType,
      chatName: result[0].chatName,
      password: result[0].password,
      isDirected: result[0].isDirected,
    });
  }

  /**
   * 방을 추가합니다. 방을 추가하고 나서 방 고유 ID를 반환합니다.
   *
   * @param room 새 방 객체
   * @returns 생성된 방 고유 ID
   */
  async addRoom(room: ChatDto): Promise<number> {
    const newChat = new Chat();
    newChat.chatType = room.chatType;
    newChat.chatName = room.chatName;
    newChat.password = room.password;
    newChat.isDirected = room.isDirected;
    const result = await this.save(newChat);
    return result.chatSeq;
  }

  /**
   * 인자로 주어진 채팅 타입에 속하는 방을 모두 검색합니다.
   *
   * @param chatTypes 채팅 타입 배열
   * @returns 채팅방 객체 배열
   */
  async searchChatroomsByChatType(chatTypes: ChatType[]): Promise<ChatDto[]> {
    const resultLists = await Promise.all(
      chatTypes.map((chatType) => this.find({
        where: {
          chatType,
        }
      })
    ));
    let rtn = [];
    for (let result of resultLists) {
      const conv = result.map(i => ({
        chatSeq: i.chatSeq,
        chatType: i.chatType,
        chatName: i.chatName,
        password: i.password,
        isDirected: i.isDirected,
      }));
      rtn = [...rtn, ...conv];
    }
    return rtn;
  }

  /**
   * 방을 삭제합니다.
   *
   * @param chatSeq 방 고유 ID
   */
  async deleteRoom(chatSeq: number): Promise<void> {
    await this.delete(chatSeq);
  }

  /**
   * 방 정보를 변경합니다.
   *
   * @param roomId 방 식별자
   * @param roomInfo 변경될 방 정보
   */
   async updateRoom(roomId: number, roomInfo: UpdateRoomDto) {
    const target = await this.findOne(roomId);

    target.chatName = roomInfo.chatName;
    target.chatType = roomInfo.chatType;
    if (roomInfo.chatType === 'CHTP40' && roomInfo.password) {
      target.password = roomInfo.password;
    }

    await this.save(target);
  }
}
