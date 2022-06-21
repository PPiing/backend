import { GetFriendsDto } from 'src/community-bar/friends/dto/get-friends.dto';
import User from 'src/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByOAuthId(oauthId: number): Promise<User> {
    return this.findOne({ userId: oauthId });
  }

  async createUser(oauthId: number, email: string, name: string): Promise<User> {
    const user = new User();
    user.userId = oauthId;
    user.email = email;
    user.nickName = name;
    return this.save(user);
  }

  async getFriendsInfo(userList: number[]): Promise<GetFriendsDto[]> {
    const friendsInfo: GetFriendsDto[] = [];
    userList.map(async (user) => {
      const findUser = await this.findOne({ userSeq: user });
      friendsInfo.push({
        userSeq: findUser.userSeq,
        nickname: findUser.nickName,
        avatarImgUri: findUser.avatarImgUri,
        status: findUser.status,
      });
    });
    return friendsInfo;
  }
}
