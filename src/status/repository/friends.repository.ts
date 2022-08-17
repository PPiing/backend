import Friends from 'src/entities/friends.entity';
import RelationStatus from 'src/enums/mastercode/relation-status.enum';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Friends)
export default class FriendsRepository extends Repository<Friends> {
  /**
   * 모든 친구의 userSeq 배열 값을 반환합니다.
   *
   * @param userSeq
   * @returns userSeq 배열
   */
  async findFriends(userSeq: number): Promise<number[]> {
    const friendsList = await this.find({
      where: {
        followerSeq: userSeq,
        isBlocked: false,
        status: RelationStatus.FRST10,
      },
    });
    return friendsList.map((friend) => friend.followeeSeq);
  }
}
