import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { UserProfileService } from './user-profile.service';
import MockUserProfileRepository from './repository/mock/mock.user-profile.repository';
import { UserProfileRepository } from './repository/user-profile.repository';

const repositories = [
  {
    provide: getRepositoryToken(UserProfileRepository),
    useClass: MockUserProfileRepository,
  },
];
@Module({
  controllers: [ProfileController],
  providers: [
    UserProfileService,
    ...repositories,
  ],
  exports: [UserProfileService],
})
export class UserProfileModule {}
