import { GetFriendsDto } from 'src/community-bar/friends/dto/get-friends.dto';
import UserStatus from 'src/enums/mastercode/user-status.enum';

export default class MockUserRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      userSeq: 1,
      userId: 10,
      nickName: 'skim',
      email: 'skim@student.42seoul.kr',
      secAuthStatus: false,
      avatarImgUri: './img/defaultProfile.png',
      status: UserStatus.USST10,
      deleteStatus: false,
      createdAt: new Date(),
    });
    this.MockEntity.push({
      userSeq: 2,
      userId: 20,
      nickName: 'kkim',
      email: 'kkim@student.42seoul.kr',
      secAuthStatus: false,
      avatarImgUri: './img/defaultProfile.png',
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

  async createUser(oauthId: number, email: string, name: string) {
    const user = {
      userSeq: this.MockEntity.length + 1,
      userId: oauthId,
      nickName: name,
      email,
      secAuthStatus: false,
      avatarImgUri: './img/defaultProfile.png',
      status: UserStatus.USST10,
      deleteStatus: false,
      createdAt: new Date(),
    };
    this.MockEntity.push(user);
    return this.MockEntity.at(this.MockEntity.length - 1);
  }

  async findByOAuthId(oauthId: number) {
    return this.MockEntity.find((v) => v.userId === oauthId);
  }

  async getFriendsInfo(userList: number[]): Promise<GetFriendsDto[]> {
    const friendsInfo: GetFriendsDto[] = [];
    userList.map(async (user) => {
      const findUser = await this.MockEntity.find((entity) => entity.userSeq === user);
      friendsInfo.push({
        userSeq: findUser.userSeq,
        nickname: findUser.nickName,
        avatarImgUri: findUser.avatarImgUri,
        status: findUser.status,
      });
    });
    return friendsInfo;
  }

  async findByNickname(nickname: string): Promise<number | undefined> {
    const result = await this.MockEntity.find((e) => e.nickName === nickname);
    return result;
  }
}
