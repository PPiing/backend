import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from 'src/game-log/game.module';
import { ProfileController } from './profile.controller';
import { AchivRepository } from './repository/achiv.repository';
import { UserAchivRepository } from './repository/user-achiv.repository';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserAchivService } from './user-achiv.service';
import { UserGameService } from './user-game.service';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfileRepository,
      UserAchivRepository,
      AchivRepository,
    ]),
    forwardRef(() => GameModule),
  ],
  controllers: [ProfileController],
  providers: [
    UserProfileService,
    UserAchivService,
    UserGameService,
  ],
  exports: [UserProfileService],
})
export class ProfileModule {}
