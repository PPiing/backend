import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  createByUserId(userId: number, email: string) {
    Logger.debug(`UserService.createByUserId: ${userId} ${email}`);
    return this.userRepository.createUser({
      userId,
      nickName: (new Date().getTime()).toString(),
      email,
    });
  }
}
