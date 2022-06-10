import { BlockDto } from 'src/chatrooms/dto/block.dto';

/**
 * 친구 차단 mock repository
 * - 10번이 11번을 차단함
 */
export default class MockFriendsRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      friendSeq: 0,
      followerSeq: 10,
      followeeSeq: 11,
      isBlocked: true,
    });
  }

  async getAllBlockedFriends(): Promise<BlockDto[]> {
    const result = this.MockEntity.filter(
      (v) => v.isBlocked === true,
    ).map((v) => ({
      from: v.followerSeq,
      to: v.followeeSeq,
    }));
    return result;
  }

  async setUnblock(relation: BlockDto): Promise<void> {
    const result = this.MockEntity.find(
      (v) => v.followerSeq === relation.from && v.followeeSeq === relation.to,
    );
    if (result) {
      result.isBlocked = false;
    }
  }

  async setBlock(relation: BlockDto): Promise<void> {
    const result = this.MockEntity.find(
      (v) => v.followerSeq === relation.from && v.followeeSeq === relation.to,
    );
    if (result) {
      result.isBlocked = true;
    } else {
      this.MockEntity.push({
        friendSeq: this.MockEntity.length,
        followerSeq: relation.from,
        followeeSeq: relation.to,
        isBlocked: true,
      });
    }
  }

  async blocked(relation: BlockDto): Promise<boolean> {
    const result = this.MockEntity.find(
      (v) => v.followerSeq === relation.from && v.followeeSeq === relation.to,
    );
    if (result) {
      return result.isBlocked;
    }
    return false;
  }

  async blockedUsers(from: number): Promise<number[]> {
    return this.MockEntity.filter(
      (v) => v.followerSeq === from && v.isBlocked === true,
    ).map((v) => v.followeeSeq);
  }
}
