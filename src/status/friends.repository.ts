import { Injectable } from '@nestjs/common';
import RelationStatus from 'src/enums/mastercode/relation-status.enum';

@Injectable()
export default class FriendsRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      friendSeq: 0,
      followerSeq: 1,
      followeeSeq: 2,
      isBlocked: false,
      status: RelationStatus.FRST10, // 친구 상태
    });
    this.MockEntity.push({
      friendSeq: 0,
      followerSeq: 2,
      followeeSeq: 1,
      isBlocked: false,
      status: RelationStatus.FRST10, // 친구 상태
    });
  }

  /**
   * 친구 상태인 userSeq의 목록을 반환해 준다.
   *
   * @param userSeq
   */
  findFriends(userSeq: number): number[] {
    const userList: number[] = this.MockEntity.filter((entity) => entity.followerSeq === userSeq
    && entity.isBlocked === false
    && entity.status === RelationStatus.FRST10);

    return userList;
  }
}
