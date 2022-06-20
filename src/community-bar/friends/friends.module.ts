import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsRepository } from './repository/friends.repository';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      FriendsRepository,
    ]),
  ],
  controllers: [FriendsController],
  providers: [
    FriendsService,
  ],
})
export class FriendsModule {}
