import { BadRequestException } from '@nestjs/common';
import RelationStatus from 'src/enums/mastercode/relation-status.enum';
import { ProfileRelation } from 'src/enums/profile-relation.enum';

export default class MockFriendsRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      friendSeq: 1,
      followerSeq: 1,
      followeeSeq: 2,
      isBlocked: false,
      status: RelationStatus.FRST10,
    });
    this.MockEntity.push({
      friendSeq: 2,
      followerSeq: 2,
      followeeSeq: 1,
      isBlocked: false,
      status: RelationStatus.FRST10,
    });
  }

  async findFriend(userSeq: number, target: number, status: RelationStatus) {
    const friend = this.MockEntity.find((entity) => entity.followerSeq === userSeq
      && entity.followeeSeq === target
      && entity.status === status);

    return friend;
  }

  async getFriends(userSeq: number): Promise<number[]> {
    const friendsInfo: number[] = [];
    await this.MockEntity.forEach((entity) => {
      if (entity.followerSeq === userSeq && entity.status === RelationStatus.FRST10) {
        friendsInfo.push(entity.followeeSeq);
      }
    });
    return friendsInfo;
  }

  async requestFriend(userSeq: number, target: number) {
    await this.MockEntity.push({
      friendSeq: this.MockEntity.length + 1,
      followerSeq: userSeq,
      followeeSeq: target,
      isBlocked: false,
      status: RelationStatus.FRST40,
    });
  }

  async acceptFriend(userSeq: number, target: number) {
    const friend = await this.findFriend(userSeq, target, RelationStatus.FRST40);
    if (!friend) {
      throw new Error('친구 요청이 없습니다.');
    }
    friend.status = RelationStatus.FRST10;
    this.MockEntity.push({
      friendSeq: this.MockEntity.length + 1,
      followerSeq: target,
      followeeSeq: userSeq,
      isBlocked: false,
      status: RelationStatus.FRST10,
    });
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
      throw new Error('친구가 아닙니다.');
    }
    const me = await this.findFriend(target, userSeq, RelationStatus.FRST10);
    if (!me) {
      throw new Error('내 친구가 아닙니다.');
    }
    friend.status = RelationStatus.FRST40;
    me.status = RelationStatus.FRST40;
  }

  async getRelation(userSeq: number, target: number) : Promise<ProfileRelation | undefined> {
    if (userSeq === target) {
      return ProfileRelation.R01;
    }

    const friend = await this.MockEntity.filter((e) => e.followerSeq === userSeq
      && e.followeeSeq === target);

    if (friend.length !== 1) {
      return ProfileRelation.R04;
    } if (friend[0].isBlocked === true) {
      return ProfileRelation.R03;
    } if (friend[0].status === RelationStatus.FRST10) {
      return ProfileRelation.R02;
    }
    return ProfileRelation.R04;
  }

  async blockedFriend(userSeq: number, target: number) {
    const friend = await this.MockEntity.filter((e) => e.followerSeq === userSeq
      && e.followeeSeq === target);

    if (friend.length === 0) { // 아무런 사이가 아니었다면
      this.MockEntity.push({
        friendSeq: this.MockEntity.length + 1,
        followerSeq: userSeq,
        followeeSeq: target,
        isBlocked: true,
        status: RelationStatus.FRST30,
      });
    } else {
      friend[0].isBlocked = true;
    }
  }

  async unblockedFriend(userSeq: number, target: number) {
    const friend = await this.MockEntity.filter((e) => e.followerSeq === userSeq
      && e.followeeSeq === target);

    if (friend === undefined) {
      throw new BadRequestException(`${userSeq} 와 ${target} 은 block 상태가 아닙니다.`);
    } else {
      friend[0].isBlocked = false;
    }
  }
}
