import { BadRequestException } from '@nestjs/common';
import Friends from 'src/entities/friends.entity';
import RelationStatus from 'src/enums/mastercode/relation-status.enum';
import { ProfileRelation } from 'src/enums/profile-relation.enum';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {
  async findFriend(userSeq: number, target: number, status: RelationStatus)
    : Promise<Friends | undefined> {
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
        isBlocked: false,
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

    await this.save(friend);
  }

  async acceptFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST40);
    if (!friend) {
      throw new Error('친구 요청이 없습니다.');
    }
    friend.status = RelationStatus.FRST10;
    const newFriend = new Friends();
    newFriend.followerSeq = target;
    newFriend.followeeSeq = userSeq;
    newFriend.isBlocked = false;
    newFriend.status = RelationStatus.FRST10;

    await this.save(friend);
  }

  async rejectFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST40);
    if (!friend) {
      throw new BadRequestException('친구 요청이 없습니다.');
    }
    friend.status = RelationStatus.FRST20;

    await this.save(friend);
  }

  async removeFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST10);
    if (!friend) {
      throw new BadRequestException('친구가 없습니다.');
    }
    friend.status = RelationStatus.FRST50;

    await this.save(friend);
  }

  async getRelation(userSeq: number, target: number) : Promise<ProfileRelation | undefined> {
    if (userSeq === target) {
      return ProfileRelation.R01;
    }
    const friend = await this.findOne({
      where: {
        followerSeq: userSeq,
        followeeSeq: target,
      },
    });

    if (friend === undefined) {
      return ProfileRelation.R04;
    } if (friend.isBlocked === true) {
      return ProfileRelation.R03;
    } if (friend.status === RelationStatus.FRST10) {
      return ProfileRelation.R02;
    }
    return ProfileRelation.R04;
  }

  async blockedFriend(userSeq: number, target: number) {
    const friend = await this.findOne({
      where: {
        followerSeq: userSeq,
        followeeSeq: target,
      },
    });
    if (friend === undefined) { // 아무런 사이가 아니었다면
      const newFriend = new Friends();
      newFriend.followerSeq = userSeq;
      newFriend.followeeSeq = target;
      newFriend.isBlocked = true;
      newFriend.status = RelationStatus.FRST30;

      await this.save(newFriend);
    } else {
      friend.isBlocked = true;

      await this.save(friend);
    }
  }

  async unblockedFriend(userSeq: number, target: number) {
    const friend = await this.findOne({
      where: {
        followerSeq: userSeq,
        followeeSeq: target,
      },
    });
    if (friend === undefined) {
      throw new BadRequestException(`${userSeq} 와 ${target} 은 block 상태가 아닙니다.`);
    } else {
      friend.isBlocked = false;

      await this.save(friend);
    }
  }
}
