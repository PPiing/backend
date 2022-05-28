import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PostgresErrorCode } from 'src/enums/postgres-error-code.enum';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');

  constructor(private readonly userRepository: UserRepository) {}

  async createByUserId(userId: number, email: string) {
    this.logger.debug(`UserService.createByUserId: ${userId} ${email}`);
    try {
      const user = this.userRepository.create({
        userId,
        email,
        nickName: (new Date().getTime()).toString(),
      });
      const result = await this.userRepository.save(user);
      return result;
    } catch (err) {
      this.logger.debug(`err catch: ${err.code}`);
      if (err?.code === PostgresErrorCode.NotNullViolation) {
        throw new HttpException('Missing required fields', 400);
      } else if (err?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException('User already exists', 409);
      } else {
        throw new HttpException(err.message, 500);
      }
    }
  }
}
