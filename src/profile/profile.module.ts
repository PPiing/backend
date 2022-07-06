import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { AchivRepository } from './repository/achiv.repository';
import { UserAchivRepository } from './repository/user-achiv.repository';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserAchivService } from './user-achiv.service';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfileRepository,
      UserAchivRepository,
      AchivRepository,
    ]),
  ],
  controllers: [ProfileController],
  providers: [
    UserProfileService,
    UserAchivService,
  ],
  exports: [UserProfileService],
})
export class ProfileModule {}
