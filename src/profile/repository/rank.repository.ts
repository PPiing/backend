import Rank from 'src/entities/rank.entity';
import { EntityRepository, Repository } from 'typeorm';
import { RankDto } from '../dto/rank.dto';

@EntityRepository(Rank)
export class RankRepository extends Repository<Rank> {
  async addRank(userSeq: number) : Promise<RankDto> {
    const target = await this.save({
      rankScore: 0,
      userSeq,
    });
    return target;
  }

  async getRank(userSeq: number) : Promise<RankDto | undefined> {
    const target = await this.find({
      where: { userSeq },
    });
    if (target.length === 0) {
      return this.addRank(userSeq);
    }
    if (target.length !== 1) {
      return undefined;
    }
    return target[0];
  }

  async saveWinUser(userSeq: number) {
    const target: RankDto = await this.getRank(userSeq);
    if (target) {
      target.rankScore += 50;
      await this.save(target);
    }
  }

  async saveLoseUser(userSeq:number) {
    const target: RankDto = await this.getRank(userSeq);
    if (target) {
      target.rankScore -= 20;
      await this.save(target);
    }
  }
}
