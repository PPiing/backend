import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import MockUserProfileRepository from './mock.user-profile.repository';
import { UserProfileService } from './user-profile.service';
import { UserProfileRepository } from './user-profile.repository';
import { UserRepository } from './user.repository';

const repositories = [
  {
    provide: getRepositoryToken(UserProfileRepository),
    useClass: MockUserProfileRepository,
  },
  {
    provide: getRepositoryToken(UserRepository),
    useClass: MockUserProfileRepository,
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
