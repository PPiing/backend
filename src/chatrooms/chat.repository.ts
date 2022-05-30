/* eslint-disable no-restricted-syntax */
// NOTE: 전체적으로 리팩터링 예정
import { Injectable } from '@nestjs/common';

@Injectable()
export default class ChatRepository {
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
      chatType: 'CHTP20',
      chatName: '장이수의 도박클럽',
      password: '',
      isDirected: false,
    });
  }

  findAllRooms(): any[] {
    return this.MockEntity;
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
      chatType: 'CHTP20',
      chatName: room.chatName,
      password: '',
      isDirected: false,
      users: [room.masterID],
    });
    return ({
      chatSeq: this.MockEntity.length - 1,
      chatType: 'CHTP20',
      chatName: room.chatName,
      password: '',
      isDirected: false,
      users: [room.masterID],
    });
  }

  searchChatroom(searchKeyword: string, page: number, count: number): any[] {
    const searchResult = [];
    for (const room of this.MockEntity) {
      if (room.chatName.includes(searchKeyword)) {
        searchResult.push(room);
      }
    }
    return searchResult.slice(page * count, page * count + count);
  }
}
