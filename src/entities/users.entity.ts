import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

// eslint-disable-next-line import/no-cycle
import Alarm from './alarm.entity';
// eslint-disable-next-line import/no-cycle
import Friends from './friends.entity';

@Entity()
export default class UserEntity {
  @PrimaryColumn()
    userSeq: number;

  @OneToMany(() => Alarm, (alarm) => alarm.receiverSeq)
    alarmSeq: Alarm[];

  @OneToMany(() => Alarm, (alarm) => alarm.senderSeq)
    alarmSeq2: Alarm[];

  @OneToMany(() => Friends, (friends) => friends.followeeSeq)
    friendsSeq: Friends[];

  @OneToMany(() => Friends, (friends) => friends.followerSeq)
    friendsSeq2: Friends[];
}
