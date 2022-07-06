import Achiv from 'src/entities/achiv.entity';
import { EntityRepository, Repository } from 'typeorm';
import { AchivDto } from '../dto/achiv.dto';

@EntityRepository(Achiv)
export default class AchivRepository extends Repository<Achiv> {
  async getAchiv(achivSeq: number) : Promise<AchivDto | undefined> {
    const target = await this.findOne(achivSeq);
    return target;
  }
}
