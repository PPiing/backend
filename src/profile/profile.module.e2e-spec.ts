import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { UserProfileService } from './user-profile.service';
import MockUserProfileRepository from './repository/mock/mock.user-profile.repository';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserAchivRepository } from './repository/user-achiv.repository';
import MockUserAchivRepository from './repository/mock/mock.user-achiv.repository';
import { AchivRepository } from './repository/achiv.repository';
import MockAchivRepository from './repository/mock/mock.achiv.repository';
import { UserAchivService } from './user-achiv.service';

const repositories = [
  {
    provide: getRepositoryToken(UserProfileRepository),
    useClass: MockUserProfileRepository,
  },
  {
    provide: getRepositoryToken(UserAchivRepository),
    useClass: MockUserAchivRepository,
  },
  {
    provide: getRepositoryToken(AchivRepository),
    useClass: MockAchivRepository,
  },
];
@Module({
  controllers: [ProfileController],
  providers: [
    UserProfileService,
    UserAchivService,
    ...repositories,
  ],
  exports: [UserProfileService],
})
export class UserProfileModule {}
