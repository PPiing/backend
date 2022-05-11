import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import Alarm from './alarm.entity';
// eslint-disable-next-line import/no-cycle
import Friends from './friends.entity';

@Entity()
export default class User {
  @PrimaryColumn()
    userSeq: number;

  @OneToMany(() => Alarm, (alarm) => alarm.receiverSeq)
    receiver: Alarm[];

  @OneToMany(() => Alarm, (alarm) => alarm.senderSeq)
    sender: Alarm[];

  @OneToMany(() => Friends, (friends) => friends.followeeSeq)
    followee: Friends[];

  @OneToMany(() => Friends, (friends) => friends.followerSeq)
    follower: Friends[];
}
