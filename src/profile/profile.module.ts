import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from 'src/community-bar/friends/friends.module';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { ProfileController } from './profile.controller';
import { AchivRepository } from './repository/achiv.repository';
import { RankRepository } from './repository/rank.repository';
import { UserAchivRepository } from './repository/user-achiv.repository';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserAchivService } from './user-achiv.service';
import { UserGameService } from './user-game.service';
import { UserProfileService } from './user-profile.service';
import { UserRankService } from './user-rank.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfileRepository,
      UserAchivRepository,
      AchivRepository,
      RankRepository,
    ]),
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
  ],
  exports: [UserProfileService, UserRankService],
})
export class ProfileModule {}
