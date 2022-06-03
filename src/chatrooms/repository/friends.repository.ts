/* eslint-disable no-restricted-syntax */
// NOTE: 친구목록에서 차단여부만 고려하고 있음.
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FriendsRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      friendSeq: 0,
      followerSeq: 10,
      followeeSeq: 11,
      isBlocked: true,
    });
  }

  async getAllBlockedFriends(): Promise<any[]> {
    const result = this.MockEntity.filter(
      (v) => v.isBlocked === true,
    );
    return result;
  }

  async setUnblock(from: number, to: number): Promise<void> {
    const result = this.MockEntity.find((v) => v.followerSeq === from && v.followeeSeq === to);
    if (result) {
      result.isBlocked = false;
    }
  }

  async setBlock(from: number, to: number): Promise<void> {
    const result = this.MockEntity.find((v) => v.followerSeq === from && v.followeeSeq === to);
    if (result) {
      result.isBlocked = true;
    } else {
      this.MockEntity.push({
        friendSeq: this.MockEntity.length,
        followerSeq: from,
        followeeSeq: to,
        isBlocked: true,
      });
    }
  }

  async blocked(from: number, to: number): Promise<boolean> {
    const result = this.MockEntity.find((v) => v.followerSeq === from && v.followeeSeq === to);
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
