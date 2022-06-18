import UserStatus from 'src/enums/mastercode/user-status.enum';

export default class MockUserRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      userSeq: 1,
      userId: 10,
      nickName: 'skim',
      email: 'skim@student.42seoul.kr',
      sedAuthStatus: false,
      avatarImgUri: './img/defaultProfile.jpg',
      status: UserStatus.USST10,
      deleteStatus: false,
      createdAt: new Date(),
    });
    this.MockEntity.push({
      userSeq: 2,
      userId: 20,
      nickName: 'kkim',
      email: 'kkim@student.42seoul.kr',
      sedAuthStatus: false,
      avatarImgUri: './img/defaultProfile.jpg',
      status: UserStatus.USST10,
      deleteStatus: false,
      createdAt: new Date(),
    });
  }

  async findOne(userSeq: number) {
    return this.MockEntity.find((v) => v.userSeq === userSeq);
  }

  async create(userData: any) {
    this.MockEntity.push(userData);
  }

  async save(userData: any) {
    this.MockEntity.push(userData);
  }

  async createUser(oauthId: number, email: string) {
    const user = {
      userSeq: this.MockEntity.length + 1,
      userId: oauthId,
      nickName: email,
      email,
      sedAuthStatus: false,
      avatarImgUri: './img/defaultProfile.jpg',
      status: UserStatus.USST10,
      deleteStatus: false,
      createdAt: new Date(),
    };
    this.MockEntity.push(user);
  }

  async findByOAuthId(oauthId: number) {
    return this.MockEntity.find((v) => v.userId === oauthId);
  }
}
