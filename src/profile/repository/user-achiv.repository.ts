import UserAchiv from 'src/entities/user-achiv.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(UserAchiv)
export class UserAchivRepository extends Repository<UserAchiv> {
  async getUserAchiv(achivSeq: number, userSeq: number): Promise<boolean> {
    const target = await this.find({
      userSeq,
      achivSeq,
    });
    if (target.length === 0) {
      return false;
    }
    return true;
  }
}
