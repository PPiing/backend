import User from 'src/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByOAuthId(oauthId: number): Promise<User> {
    return this.findOne({ userId: oauthId });
  }

  async createUser(oauthId: number, email: string): Promise<User> {
    const user = new User();
    user.userId = oauthId;
    user.email = email;
    user.nickName = email;
    return this.save(user);
  }
}
