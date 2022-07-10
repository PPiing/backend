import Achiv from 'src/entities/achiv.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export class CreateInitialAchivData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Achiv)
      .values([
        {
          achivSeq: 1,
          achivTitle: 'Score50',
          achivImgUri: './achiv1.jpg',
          totalScore: 50,
        },
        {
          achivSeq: 2,
          achivTitle: 'Score100',
          achivImgUri: './achiv2.jpg',
          totalScore: 100,
        },
        {
          achivSeq: 3,
          achivTitle: 'Score150',
          achivImgUri: './achiv3.jpg',
          totalScore: 150,
        }
      ])
      .execute();
  }
}