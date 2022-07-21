import { forwardRef, Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameModule } from 'src/game/game.module.e2e-spec';
import { UserModule } from 'src/user/user.module.e2e-spec';
import { FriendsModule } from 'src/community-bar/friends/friends.module.e2e-spec';
import { ProfileController } from './profile.controller';
import { UserProfileService } from './user-profile.service';
import MockUserProfileRepository from './repository/mock/mock.user-profile.repository';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserAchivRepository } from './repository/user-achiv.repository';
import MockUserAchivRepository from './repository/mock/mock.user-achiv.repository';
import { AchivRepository } from './repository/achiv.repository';
import MockAchivRepository from './repository/mock/mock.achiv.repository';
import { UserAchivService } from './user-achiv.service';
import { UserGameService } from './user-game.service';
import { RankRepository } from './repository/rank.repository';
import MockRankRepository from './repository/mock/mock.rank.repository';
import { UserRankService } from './user-rank.service';

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
  {
    provide: getRepositoryToken(RankRepository),
    useClass: MockRankRepository,
  },
];
@Module({
  imports: [
    forwardRef(() => GameModule),
    forwardRef(() => FriendsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ProfileController],
  providers: [
    UserProfileService,
    UserAchivService,
    UserGameService,
    UserRankService,
    ...repositories,
  ],
  exports: [UserProfileService],
})
export class ProfileModule {}
