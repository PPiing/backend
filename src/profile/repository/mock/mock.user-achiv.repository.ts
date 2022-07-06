import { UserAchivDto } from 'src/profile/dto/user-achiv.dto';

export default class MockUserAchivRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      userAchivSeq: 1,
      achivSeq: 1,
      userSeq: 1,
    });
    this.MockEntity.push({
      userAchivSeq: 2,
      achivSeq: 2,
      userSeq: 1,
    });
    this.MockEntity.push({
      userAchivSeq: 3,
      achivSeq: 1,
      userSeq: 2,
    });
  }

  async getUserAchiv(userSeq: number): Promise<UserAchivDto[] | undefined> {
    const target : UserAchivDto[] = await this.MockEntity.filter((e) => e.userSeq === userSeq);
    if (target.length === 0) {
      return undefined;
    }
    return target;
  }
}
