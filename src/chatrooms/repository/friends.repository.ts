/* eslint-disable */
// NOTE 추후에 데이터베이스 연동시에 해당 옵션을 제거할 것
import Friends from 'src/entities/friends.entity';
import { EntityRepository, Repository } from 'typeorm';
import { BlockDto } from '../dto/block.dto';

@EntityRepository(Friends)
export default class FriendsRepository extends Repository<Friends> {
  /**
   * 누가 누구를 차단하였는지에 대한 결과를 전부 반환합니다.
   *
   * @returns BlockDto 배열
   */
  async getAllBlockedFriends(): Promise<BlockDto[]> {
    return [];
  }

  /**
   * 인자로 주어진 관계에 대해 차단을 해제합니다.
   *
   * @param relation 관계
   */
  async setUnblock(relation: BlockDto): Promise<void> {
  }

  /**
   * 인자로 주어진 관계에 대해 차단을 적용합니다.
   *
   * @param relation 관계
   */
  async setBlock(relation: BlockDto): Promise<void> {
  }

  /**
   * 인자로 주어진 관계가 차단되어 있는지 확인합니다.
   *
   * @param relation 관계
   * @returns 차단 여부
   */
  async blocked(relation: BlockDto): Promise<boolean> {
    return false;
  }

  /**
   * 인자로 주어진 사용자가 누구를 차단하였는지에 대한 결과를 반환합니다.
   *
   * @param from 차단을 건 사람
   * @returns 차단당한 사람들
   */
  async blockedUsers(from: number): Promise<number[]> {
    return [];
  }
}
