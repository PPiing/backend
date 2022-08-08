import ChatDto from 'src/chatrooms/dto/chat.dto';
import { UpdateRoomDto } from 'src/chatrooms/dto/update-room.dto';
import ChatType from 'src/enums/mastercode/chat-type.enum';

/**
 * 채팅방 mock repository
 * - 푸주홍의 등산클럽, 공개 채팅방
 * - 장이수의 도박클럽, 암호 걸린 채팅방, 비밀번호 : puju
 * - 장첸의 마라롱샤클럽, 비공개 채팅방
 */
export default class MockChatRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      chatSeq: 0,
      chatType: 'CHTP20',
      chatName: '푸주홍의 등산클럽',
      password: '',
      isDirected: false,
    });
    this.MockEntity.push({
      chatSeq: 1,
      chatType: 'CHTP30',
      chatName: '장이수의 도박클럽',
      password: '$2b$10$gnY2ITzIrJKgw2HxH5GETOKO6ICbRLCvge1e3xta1UM1CceZCz1Ia', // puju
      isDirected: false,
    });
    this.MockEntity.push({
      chatSeq: 2,
      chatType: 'CHTP40',
      chatName: '장첸의 마라롱샤클럽',
      password: '',
      isDirected: false,
    });
  }

  async findRoomByRoomId(chatSeq: number): Promise<ChatDto | null> {
    const rtn = this.MockEntity.find((entity) => entity.chatSeq === chatSeq);
    return rtn === undefined ? null : rtn as ChatDto;
  }

  async findRoomByRoomName(chatName: string): Promise<ChatDto | null> {
    const rtn = this.MockEntity.find((entity) => entity.chatName === chatName);
    return rtn === undefined ? null : rtn as ChatDto;
  }

  async addRoom(room: any): Promise<number> {
    this.MockEntity.push({
      chatSeq: this.MockEntity.length,
      chatType: room.chatType,
      chatName: room.chatName,
      password: room.password,
      isDirected: room.chatType === 'CHTP10',
    });
    return (this.MockEntity.length - 1);
  }

  async searchChatroomsByChatType(chatTypes: ChatType[]): Promise<any[]> {
    return this.MockEntity.filter((entity) => chatTypes.includes(entity.chatType));
  }

  async deleteRoom(chatSeq: number): Promise<void> {
    this.MockEntity = this.MockEntity.filter(
      (entity) => !(entity.chatSeq === chatSeq),
    );
  }

  async updateRoom(roomId: number, roomInfo: UpdateRoomDto) {
    const target = this.MockEntity.find((e) => e.chatSeq === roomId);
    target.chatName = roomInfo.chatName;
    target.chatType = roomInfo.chatType;
    if (roomInfo.chatType === 'CHTP40') {
      target.password = roomInfo.password;
    }
  }
}
