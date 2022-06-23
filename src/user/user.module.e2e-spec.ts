import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import MockUserRepository from './repository/mock/mock.user.repository';

const repositories = [
  {
    provide: getRepositoryToken(UserRepository),
    useClass: MockUserRepository,
  },
];

@Module({
  providers: [
    UserService,
    ...repositories,
  ],
  exports: [UserService],
})
export class UserModule {}
