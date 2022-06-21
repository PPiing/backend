import { Injectable, Logger } from '@nestjs/common';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    private readonly friendsRepository: FriendsRepository,
  ) {}

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
   * @param userSeq
   * @param target
   */
  async acceptFriend(userSeq: number, target: number) {
    this.logger.log(`친구 요청 수락 요청: ${userSeq} -> ${target}`);
    await this.friendsRepository.acceptFriend(userSeq, target);
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
}
