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

  async getUserAchiv(achivSeq: number, userSeq: number): Promise<boolean> {
    const target = await this.MockEntity.filter(
      (e) => e.userSeq === userSeq && e.achivSeq === achivSeq,
    );
    if (target.length === 0) {
      return false;
    }
    return true;
  }
}
