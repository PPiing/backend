import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
import { FriendsRepository } from 'src/community-bar/friends/repository/friends.repository';
import UserStatus from 'src/enums/mastercode/user-status.enum';
import UserStatusRepository from './repository/user-status.repository';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(
    private statusRepository: UserStatusRepository,
    private friendRepository: FriendsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * 사용자 접속 시 캐시에 userSeq, 소켓 ID를 저장합니다.
   *
   * @param userSocket 잡속한 사용자 소켓 ID
   * @param userSeq 접속 사용자 시퀀스
   */
  async onlineUserAdd(userSocket: Socket, userSeq: number): Promise<void> {
    this.logger.debug(`online User Add: ${userSeq}`);

    const key = `StatusService-userID-${userSeq}`;
    const value: undefined | Array<string> = await this.cacheManager.get(key);
    if (value === undefined) {
      await this.cacheManager.set(key, [userSocket.id]);
    } else {
      await this.cacheManager.set(key, [...value, userSocket.id]);
    }
  }

  /**
   * 사용자 접속이 끊기면 캐시에서 사용자의 리스트를 제거합니다.
   *
   * @param userSocket 접속한 사용자 소켓 ID
   * @param userSeq 접속이 끊긴 사용자 시퀀스
   */
  async onlineUserRemove(userSocket: Socket, userSeq: number): Promise<void> {
    this.logger.debug(`online User Remove: ${userSeq}`);

    const key = `StatusService-userID-${userSeq}`;
    const value: undefined | Array<string> = await this.cacheManager.get(key);
    if (value) {
      const newValue = value.filter((v) => v !== userSocket.id);
      if (newValue.length > 0) {
        await this.cacheManager.set(key, newValue);
      } else {
        await this.cacheManager.del(key);
      }
    }
  }

  /**
   * 처음 접속했을 때
   * client의 정보와 현재의 상태를 online으로 저장한다.
   *
   * @param client 접속된 client socket
   */
  async saveClient(client: Socket, userSeq: number) {
    this.logger.debug(`save Client: ${userSeq}`);

    this.cacheManager.set(client.id, userSeq, { ttl: 0 });
    this.cacheManager.set(String(userSeq), client.id, { ttl: 0 });
    await this.statusRepository.updateUserStatus(userSeq, UserStatus.USST10);
  }

  /**
   * 접속을 종료하였을 때
   * database 내 client의 현재의 상태를 offline으로 저장한다.
   *
   * @param client 접속된 client socket
   */
  async logoutUser(userSeq: number) {
    this.logger.debug(`remove Client: ${userSeq}`);

    await this.statusRepository.updateUserStatus(userSeq, UserStatus.USST20);
  }

  /**
   * 상태를 업데이트 할때 (게임중 or 온라인으로 변경 가능)
   *
   * @param client 접속된 client socket
   * @param status 상태 (enum으로 변경 예정)
   */
  async updateStatus(userSeq: number, status: UserStatus) {
    this.logger.debug(`update Status: ${userSeq} , ${status}`);
    console.log('🚀 ~ file: status.service.ts ~ line 100 ~ StatusService ~ updateStatus ~ userSeq', userSeq);
    // await repository의 updateStatus 호출
    await this.statusRepository.updateUserStatus(userSeq, status);
  }

  /**
   *
   * @param client 접속된 client socket
   * @returns 접속 된 소켓의 userSeq
   */
  async getUserSeq(client: Socket): Promise<number> {
    const userSeq: number = await this.cacheManager.get(client.id);

    return userSeq;
  }

  /**
   *
   * @param userSeq 유저의 seq
   * @returns 해당 유저와 유저의 친구 목록
   */
  async getFriends(userSeq: number): Promise<string[]> {
    this.logger.debug(`get Friends: ${userSeq}`);

    const friends: number[] = await this.friendRepository.findFriends(userSeq);
    const friendsList: string[] = [];
    friends.forEach(async (friend) => {
      const friendId: string = await this.cacheManager.get(String(friend));
      friendsList.push(friendId);
    });
    friendsList.push(await this.cacheManager.get(String(userSeq)));

    return friendsList;
  }
}
