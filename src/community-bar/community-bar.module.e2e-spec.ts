import { Module } from '@nestjs/common';
import { FriendsModule } from './friends/friends.module.e2e-spec';

@Module({
  imports: [FriendsModule],
})
export class CommunityBarModule {}
