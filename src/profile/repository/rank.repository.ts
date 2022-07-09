import Rank from 'src/entities/rank.entity';
import { EntityRepository, Repository } from 'typeorm';
import { RankDto } from '../dto/rank.dto';

@EntityRepository(Rank)
export class RankRepository extends Repository<Rank> {
  async getRank(userSeq: number) : Promise<RankDto | undefined> {
    const target = await this.find({
      userSeq,
    });
    if (target.length !== 1) {
      return undefined;
    }
    return target[0];
  }
}
