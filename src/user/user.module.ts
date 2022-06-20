import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProfileService } from './user-profile.service';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      UserProfileRepository,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserProfileService,
  ],
  exports: [UserService, UserProfileService],
})
export class UserModule {}
