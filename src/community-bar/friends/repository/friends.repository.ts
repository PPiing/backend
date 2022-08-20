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
        followerSeq: target,
        followeeSeq: userSeq,
        status,
      },
    });
    return friend;
  }

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
        status: RelationStatus.FRST10,
      },
    });
    return friendsList.map((friend) => friend.followeeSeq);
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
    // const check = await this.findFriend(userSeq, target, RelationStatus.FRST30);
    // if (check) {
    //   throw new Error('해당 친구에게 차단당한 상태입니다');
    // }
    // const youCheck = await this.findFriend(target, userSeq, RelationStatus.FRST30);
    // if (youCheck) {
    //   throw new Error('해당 친구를 차단된 상태입니다');
    // }
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
    newFriend.followerSeq = userSeq;
    newFriend.followeeSeq = target;
    newFriend.isBlocked = false;
    newFriend.status = RelationStatus.FRST10;

    await this.save(friend);
    await this.save(newFriend);
  }

  async rejectFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST40);
    if (!friend) {
      throw new BadRequestException('친구 요청이 없습니다.');
    }
    // friend.status = RelationStatus.FRST20;
    await this.delete(friend);
    // await this.save(friend);
  }

  async removeFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST10);
    if (!friend) {
      throw new BadRequestException('친구가 없습니다.');
    }
    await this.delete(friend);

    const me = await this.findFriend(target, userSeq, RelationStatus.FRST10);
    if (!me) {
      throw new BadRequestException('나에게 친구가 없습니다.');
    }
    await this.delete(me);
    // friend.status = RelationStatus.FRST40;
    // me.status = RelationStatus.FRST40;

    // await this.save(friend);
    // await this.save(me);
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
      // 내가 친구를 차단하면 친구에겐 내가 안보이게 됨(친구에서 나 차단아님)
      friend.isBlocked = true;
      // friend.status = RelationStatus.FRST30;
      // const another = await this.findFriend(userSeq, target, RelationStatus.FRST10);
      // another.status = RelationStatus.FRST40;
      await this.save(friend);
      // await this.save(another);
    }
  }

  async unblockedFriend(userSeq: number, target: number) {
    const friend = await this.findOne({
      where: {
        followerSeq: userSeq,
        followeeSeq: target,
        isBlocked: true,
        // status: RelationStatus.FRST30,
      },
    });
    if (friend === undefined) {
      throw new BadRequestException(`${userSeq} 와 ${target} 은 block 상태가 아닙니다.`);
    } else {
      const another = await this.findOne({
        where: {
          followerSeq: target,
          followeeSeq: userSeq,
          isBlocked: false,
        },
      });
      if (another) {
        await this.delete(another);
        // await this.save(another);
      }
      await this.delete(friend);
      // await this.save(friend);
    }
  }

  async getBlockList(target: number): Promise<number[]> {
    const friendsList = await this.find({
      where: {
        followerSeq: target,
        isBlocked: true,
        // status: RelationStatus.FRST30,
      },
    });
    const blocklist = friendsList.map((user) => user.followeeSeq);
    return blocklist;
  }
}
