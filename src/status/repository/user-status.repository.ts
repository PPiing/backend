import User from 'src/entities/user.entity';
import UserStatus from 'src/enums/mastercode/user-status.enum';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export default class UserStatusRepository extends Repository<User> {
  /**
   * userSeq 조회 후 status 값을 업데이트 합니다.
   *
   * @param userSeq
   * @param status
   */
  async updateUserStatus(userSeq: number, status: UserStatus): Promise<void> {
    const result = await this.findOne(userSeq);
    if (result === null || result === undefined) {
      return;
    }
    result.status = status;
    await this.save(result);
  }
}
