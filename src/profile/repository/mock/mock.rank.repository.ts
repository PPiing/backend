import { RankDto } from "src/profile/dto/rank.dto";

export default class MockRankRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      rankSeq: 1,
      rankScore: 50,
      userSeq: 1,
    });
    this.MockEntity.push({
      rankSeq: 2,
      rankScore: 70,
      userSeq: 2,
    });
    this.MockEntity.push({
      rankSeq: 2,
      rankScore: 70,
      userSeq: 3,
    });
  };

  async getRank(userSeq: number) : Promise<RankDto | undefined> {
    const target = await this.MockEntity.filter(e => e.userSeq === userSeq);
    if (target.length !== 1) {
      return undefined;
    }
    return target[0];
  }
}
