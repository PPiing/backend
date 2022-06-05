/* eslint-disable no-restricted-syntax */
// NOTE: 전체적으로 리팩터링 예정
import { Injectable } from '@nestjs/common';
import ChatType from 'src/enums/mastercode/chat-type.enum';

@Injectable()
export default class ChatRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      chatSeq: 0,
      chatType: 'CHTP20',
      chatName: '푸주홍의 등산클럽',
      isDirected: false,
    });
    this.MockEntity.push({
      chatSeq: 1,
      chatType: 'CHTP30',
      chatName: '장이수의 도박클럽',
      password: '$2b$10$gnY2ITzIrJKgw2HxH5GETOKO6ICbRLCvge1e3xta1UM1CceZCz1Ia', // puju
      isDirected: false,
    });
  }

  findRoomByRoomId(chatSeq: number): any {
    for (const room of this.MockEntity) {
      if (room.chatSeq === chatSeq) {
        return room;
      }
    }
    return null;
  }

  findRoomByRoomName(chatName: string): any {
    for (const room of this.MockEntity) {
      if (room.chatName === chatName) {
        return room;
      }
    }
    return null;
  }

  addRoom(room: any): any {
    this.MockEntity.push({
      chatSeq: this.MockEntity.length,
      chatType: room.chatType,
      chatName: room.chatName,
      password: room.password,
      isDirected: room.chatType === 'CHTP10',
    });
    return ({
      chatSeq: this.MockEntity.length - 1,
      chatType: room.chatType,
      chatName: room.chatName,
      password: room.password,
      isDirected: room.chatType === 'CHTP10',
    });
  }

  async searchChatroomByChatType(chatTypes: ChatType[]): Promise<any[]> {
    return this.MockEntity.filter((entity) => chatTypes.includes(entity.chatType));
  }

  async deleteRoom(chatSeq: number): Promise<void> {
    this.MockEntity = this.MockEntity.filter(
      (entity) => !(entity.chatSeq === chatSeq),
    );
  }
}
