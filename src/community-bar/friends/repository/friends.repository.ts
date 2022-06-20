import Friends from 'src/entities/friends.entity';
import RelationStatus from 'src/enums/mastercode/relation-status.enum';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {
  async findFriend(userSeq: number, target: number, status: RelationStatus): Promise<Friends> {
    const friend = await this.findOne({
      where: {
        followerSeq: userSeq,
        followeeSeq: target,
        status,
      },
    });
    return friend;
  }

  async getFriends(userSeq: number): Promise<number[]> {
    const friends = await this.find({
      where: {
        followerSeq: userSeq,
        status: RelationStatus.FRST10,
      },
    });
    return friends.map((friend) => friend.followeeSeq);
  }

  async requestFriend(userSeq: number, target: number) {
    const friend = new Friends();
    friend.followerSeq = userSeq;
    friend.followeeSeq = target;
    friend.isBlocked = false;
    friend.status = RelationStatus.FRST40;
  }

  async acceptFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST40);
    if (!friend) {
      throw new Error('친구 요청이 없습니다.');
    }
    friend.status = RelationStatus.FRST10;
  }

  async rejectFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST40);
    if (!friend) {
      throw new Error('친구 요청이 없습니다.');
    }
    friend.status = RelationStatus.FRST20;
  }

  async removeFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST10);
    if (!friend) {
      throw new Error('친구가 없습니다.');
    }
    friend.status = RelationStatus.FRST50;
  }
}
