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
      users: ['puju'],
    });
    this.MockEntity.push({
      chatSeq: 1,
      chatType: 'CHTP20',
      chatName: '장이수의 도박클럽',
      password: '',
      isDirected: false,
      users: ['isu', 'puju'],
    });
  }

  findAllRooms(): any[] {
    return this.MockEntity;
  }

  findRoomsByUserId(id: string): any[] {
    return this.MockEntity.filter((room) => room.users.includes(id));
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

  addUser(chatSeq: number, users: any[]): boolean {
    for (const room of this.MockEntity) {
      if (room.chatSeq === chatSeq) {
        room.users.push(...users);
        return true;
      }
    }
    return false;
  }

  removeUser(chatSeq: number, user: any): boolean {
    for (const room of this.MockEntity) {
      if (room.chatSeq as number === chatSeq) {
        room.users = room.users.filter((u) => u !== user);
        return true;
      }
    }
    return false;
  }
}
