import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProfileService } from './user-profile.service';
import MockUserProfileRepository from './repository/mock/mock.user-profile.repository';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserRepository } from './repository/user.repository';
import MockUserRepository from './repository/mock/mock.user.repository';

const repositories = [
  {
    provide: getRepositoryToken(UserProfileRepository),
    useClass: MockUserProfileRepository,
  },
  {
    provide: getRepositoryToken(UserRepository),
    useClass: MockUserRepository,
  },
];

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserProfileService,
    ...repositories,
  ],
  exports: [UserService],
})
export class UserModule {}
