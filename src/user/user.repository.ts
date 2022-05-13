import { HttpException, Logger } from '@nestjs/common';
import User from 'src/entities/user.entity';
import { PostgresErrorCode } from 'src/enums/postgres-error-code.enum';
import { EntityRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(user: CreateUserDto) {
    Logger.debug(`UserRepository: createUser: ${JSON.stringify(user)}`);
    const existingUser = await this.find({
      where: [{ userId: user.userId }, { nickName: user.nickName }],
    });
    if (existingUser.length !== 0) {
      Logger.debug(`UserRepository: existingUser: ${JSON.stringify(existingUser)}`);
      return new HttpException('User already exists', 409);
    }
    try {
      Logger.debug(`UserRepository: save user try: ${user.userId} ${user.nickName}`);
      const result = await this.save(user);
      return result;
    } catch (err) {
      Logger.debug(`UserRepository.createUser catch: ${err.code}`);
      if (err?.code === PostgresErrorCode.NotNullViolation) {
        throw new HttpException('Missing required fields', 400);
      } else {
        // 수정 요
        throw new HttpException(err.message, 500);
      }
    }
  }
}
