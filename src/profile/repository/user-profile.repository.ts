import User from 'src/entities/user.entity';
import { EntityRepository, Repository, Like } from 'typeorm';
import { GetUserDto } from '../dto/get-user.dto';
import { SearchUserDto } from '../dto/search-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@EntityRepository(User)
export class UserProfileRepository extends Repository<User> {
  async getUser(userSeq: number): Promise<GetUserDto | undefined> {
    const user = await this.findOne(userSeq);
    if (!user) {
      return undefined;
    }
    return ({
      userSeq: user.userSeq,
      userName: user.nickName,
      userEmail: user.email,
      userStatus: user.status,
      userImage: user.avatarImgUri,
      userSecAuthStatus: user.secAuthStatus,
    });
  }

  async checkUser(userSeq: number): Promise<boolean> {
    const user = await this.findOne(userSeq);
    if (!user) {
      return false;
    }
    return true;
  }

  async updateUser(userSeq: number, userData: UpdateUserDto): Promise<UpdateUserDto> {
    const user = await this.findOne(userSeq);
    user.nickName = userData.nickName;
    user.email = userData.email;
    user.secAuthStatus = userData.secAuthStatus;
    user.avatarImgUri = userData.avatarImgUri;
    await this.save(user);
    return ({
      nickName: user.nickName,
      email: user.email,
      secAuthStatus: user.secAuthStatus,
      avatarImgUri: user.avatarImgUri,
    });
  }

  async deleteUser(userSeq: number) {
    const user = await this.findOne(userSeq);
    user.deleteStatus = true;
    await this.save(user);
  }

  async searchUsersByKeyword(nickname: string): Promise<SearchUserDto[]> {
    if (nickname === '') {
      return [];
    }
    const users = await this.find({
      where: {
        nickName: Like(`%${nickname}%`),
      },
    });
    return users.map((user) => ({
      userSeq: user.userSeq,
      nickName: user.nickName,
      userStatus: user.status,
      userImage: user.avatarImgUri,
    }));
  }
}
