import User from 'src/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { GetUserDto } from '../dto/get-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@EntityRepository(User)
export class UserProfileRepository extends Repository<User> {
  async getUser(userSeq: number): Promise<GetUserDto | undefined> {
    const user = await this.findOne(userSeq);
    if (!user) {
      return undefined;
    }
    return ({
      userName: user.nickName,
      userEmail: user.email,
      userStatus: user.status,
      userImage: user.avatarImgUri,
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
    user.secAuthStatuc = userData.secAuthStatus;
    user.avatarImgUri = userData.avatarImgUri;
    await this.save(user);
    return ({
      nickName: user.nickName,
      email: user.email,
      secAuthStatus: user.secAuthStatuc,
      avatarImgUri: user.avatarImgUri,
    });
  }

  async deleteUser(userSeq: number) {
    const user = await this.findOne(userSeq);
    user.deleteStatus = true;
    await this.save(user);
  }

  async searchUsersByNickname(nickname: string): Promise<GetUserDto[]> {
    const users = await this.find({
      where: {
        nickName: `%${nickname}%`,
      },
    });
    return users.map((user) => ({
      userName: user.nickName,
      userEmail: user.email,
      userStatus: user.status,
      userImage: user.avatarImgUri,
    }));
  }
}
