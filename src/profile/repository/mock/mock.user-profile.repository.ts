import UserStatus from 'src/enums/mastercode/user-status.enum';
import { GetUserDto } from 'src/profile/dto/get-user.dto';
import { UpdateUserDto } from 'src/profile/dto/update-user.dto';

export default class MockUserProfileRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      userSeq: 1,
      userId: 10,
      nickName: 'skim',
      email: 'skim@student.42seoul.kr',
      secAuthStatus: false,
      avatarImgUri: 'defaultProfile.jpg',
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
      avatarImgUri: 'defaultProfile.jpg',
      status: UserStatus.USST10,
      deleteStatus: false,
      createdAt: new Date(),
    });
  }

  async getUser(userSeq: number): Promise<GetUserDto | undefined> {
    const user = await this.MockEntity.find((u) => u.userSeq === userSeq);
    if (!user) {
      return undefined;
    }
    return ({
      userSeq: user.userSeq,
      userName: user.nickName,
      userEmail: user.email,
      userStatus: user.status,
      userImage: user.avatarImgUri,
    });
  }

  async checkUser(userSeq: number): Promise<boolean> {
    const user = await this.MockEntity.find((u) => u.userSeq === userSeq);
    if (!user) {
      return false;
    }

    return true;
  }

  async updateUser(userSeq: number, userData: UpdateUserDto): Promise<UpdateUserDto> {
    const userIdx = await this.MockEntity.findIndex((u) => u.userSeq === userSeq);
    this.MockEntity[userIdx].nickName = userData.nickName;
    this.MockEntity[userIdx].email = userData.email;
    this.MockEntity[userIdx].secAuthStatus = userData.secAuthStatus;
    this.MockEntity[userIdx].avatarImgUri = userData.avatarImgUri;

    return ({
      nickName: this.MockEntity[userIdx].nickName,
      email: this.MockEntity[userIdx].email,
      secAuthStatus: this.MockEntity[userIdx].secAuthStatus,
      avatarImgUri: this.MockEntity[userIdx].avatarImgUri,
    });
  }

  async deleteUser(userSeq: number) {
    const userIdx = await this.MockEntity.findIndex((u) => u.userSeq === userSeq);
    this.MockEntity.splice(userIdx, userIdx + 1);
  }

  async searchUsersByKeyword(nickname: string): Promise<GetUserDto[]> {
    const users = this.MockEntity.filter((u) => u.nickName.indexOf(nickname) >= 0);
    return users.map((user) => ({
      userSeq: user.nickName,
      userName: user.nickName,
      userEmail: user.email,
      userStatus: user.status,
      userImage: user.avatarImgUri,
    }));
  }
}
