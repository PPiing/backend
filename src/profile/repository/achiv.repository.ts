import Achiv from 'src/entities/achiv.entity';
import { EntityRepository, getManager, Repository } from 'typeorm';
import { AchivDto } from '../dto/achiv.dto';

@EntityRepository(Achiv)
export class AchivRepository extends Repository<Achiv> {
  async getAchiv() : Promise<AchivDto[] | undefined> {
    const em = getManager();
    const achives = await em.query('select * from achiv');
    if (achives.length === 0) {
      return undefined;
    }
    return achives;
  }
}
