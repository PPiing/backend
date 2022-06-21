import { Module } from '@nestjs/common';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [FriendsModule],
})
export class CommunityBarModule {}
