import UserAchiv from 'src/entities/user-achiv.entity';
import { EntityRepository, Repository } from 'typeorm';
import { UserAchivDto } from '../dto/user-achiv.dto';

@EntityRepository(UserAchiv)
export class UserAchivRepository extends Repository<UserAchiv> {
  async getUserAchiv(userSeq: number): Promise<UserAchivDto[] | undefined> {
    const target = await this.find({
      userSeq,
    });
    if (target.length === 0) {
      return undefined;
    }
    return target;
  }
}
