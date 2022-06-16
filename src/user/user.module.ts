import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import MockUserProfileRepository from './mock.user-profile.repository';
import { UserProfileService } from './user-profile.service';

// const repositories = [
//   {
//     provide :getRepositoryToken(UserRepository),
//     useClass: UserRepository,
//   },
//   {
//     provide :getRepositoryToken(UserProfileRepository),
//     useClass: MockUserProfileRepository,
//   }
// ]

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserProfileService,
    UserRepository,
    MockUserProfileRepository,
  ],
  exports: [UserService],
})
export class UserModule {}
