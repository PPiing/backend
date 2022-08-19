import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
import { AlarmService } from 'src/alarm/alarm.service';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';
import { ProfileRelation } from 'src/enums/profile-relation.enum';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    private readonly friendsRepository: FriendsRepository,
    private readonly alarmService: AlarmService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 사용자 접속 시 캐시에 userSeq, 소켓 ID를 저장합니다.
   *
   * @param userSocket 잡속한 사용자 소켓 ID
   * @param userSeq 접속 사용자 시퀀스
   */
  async onlineUserAdd(userSocket: Socket, userSeq: number): Promise<void> {
    const key = `FriendService-userID-${userSeq}`;
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
    const key = `AlarmService-userID-${userSeq}`;
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
   * 사용자 시퀀스를 캐시에서 검색하여 소켓 아이디를 반환합니다.
   *
   * @param userSeq
   * @return 사용자 소켓 IDs
   */
  async getOnlineClients(userSeq: number): Promise<Array<string>> {
    const key = `FriendService-userID-${userSeq}`;
    const value: undefined | Array<string> = await this.cacheManager.get(key);
    if (value === undefined) {
      return [];
    }
    return value;
  }

  /**
   * 친구 목록을 받아옵니다.
   *
   * @param userSeq
   * @return 친구 목록
   */
  async getFriends(userSeq: number): Promise<number[]> {
    this.logger.log(`친구 목록 조회 요청: ${userSeq}`);
    const friends:number[] = await this.friendsRepository.getFriends(userSeq);
    return friends;
  }

  /**
   * 친구 요청을 보냅니다.
   *
   * @param userSeq
   * @param target
   */
  async requestFriend(userSeq: number, target: number) {
    this.logger.log(`친구 요청 요청: ${userSeq}`);
    await this.friendsRepository.requestFriend(userSeq, target);
  }

  /**
   * 친구 요청을 수락합니다.
   *
   * @param userSeq 요청한 사람.
   * @param target 수락한 사람
   */
  async acceptFriend(userSeq: number, target: number) {
    this.logger.log(`친구 요청 수락 요청: ${userSeq} -> ${target}`);
    await this.friendsRepository.acceptFriend(userSeq, target);
    const alarm = await this.alarmService.findAlarm(
      target,
      userSeq,
      AlarmType.ALTP20,
      AlarmCode.ALAM20,
    );
    await this.alarmService.readAlarm(alarm, userSeq);
  }

  /**
   * 친구 요청을 거절합니다.
   *
   * @param userSeq
   * @param target
   */
  async rejectFriend(userSeq: number, target: number) {
    this.logger.log(`친구 요청 거절 요청: ${userSeq} -> ${target}`);
    await this.friendsRepository.rejectFriend(userSeq, target);
    const alarm = await this.alarmService.findAlarm(
      target,
      userSeq,
      AlarmType.ALTP20,
      AlarmCode.ALAM20,
    );
    await this.alarmService.readAlarm(alarm, userSeq);
  }

  /**
   * 친구를 삭제 합니다.
   *
   * @param target
   */
  async removeFriend(userSeq: number, target: number) {
    this.logger.log(`친구 삭제 요청: ${userSeq} -> ${target}`);
    await this.friendsRepository.removeFriend(userSeq, target);
  }

  /**
   * 친구와 어떤 관계인지 확인합니다.
   *
   * @param target
   */
  async checkRelation(userSeq: number, target: number): Promise<ProfileRelation> {
    this.logger.log(`친구 관계 확인 요청: ${userSeq} -> ${target}`);
    return this.friendsRepository.getRelation(userSeq, target);
  }

  /**
   * 친구를 차단합니다.
   *
   * @param target
   */
  async blockFriend(userSeq: number, target: number) {
    this.logger.log(`${userSeq}가 ${target}을 차단합니다`);

    await this.friendsRepository.blockedFriend(userSeq, target);
  }

  /**
   * 친구를 차단 해제합니다.
   *
   * @param target
   */
  async unblockFriend(userSeq: number, target: number) {
    this.logger.log(`${userSeq}가 ${target}의 차단을 해지합니다`);

    await this.friendsRepository.unblockedFriend(userSeq, target);
  }

  /**
   * 블락 리스트를 가져옵니다.
   *
   * @param target
   */
  async getBlockList(target: number): Promise<number[]> {
    this.logger.log(`${target} 의 블락 리스트를 가져옵니다.`);

    const blockList = await this.friendsRepository.getBlockList(target);
    return blockList;
  }
}
