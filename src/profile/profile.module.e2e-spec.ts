import { forwardRef, Module } from '@nestjs/common';
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
import { UserGameService } from './user-game.service';
import { GameModule } from 'src/game-log/game.module';

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
  imports: [
    forwardRef(() => GameModule),
  ],
  controllers: [ProfileController],
  providers: [
    UserProfileService,
    UserAchivService,
    UserGameService,
    ...repositories,
  ],
  exports: [UserProfileService],
})
export class UserProfileModule {}
