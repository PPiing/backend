import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfileRepository,
    ]),
  ],
  controllers: [ProfileController],
  providers: [
    UserProfileService,
  ],
  exports: [UserProfileService],
})
export class ProfileModule {}
