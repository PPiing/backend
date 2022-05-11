import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import Alarm from './alarm.entity';
import ChatParticipant from './chat-participant.entity';
import Friends from './friends.entity';
import GameLog from './gamelog.entity';

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

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.userSeq)
    partcSeq: ChatParticipant[];

  @OneToMany(() => GameLog, (gamelog) => gamelog.winnerSeq)
    winnergameSeq: GameLog[];

  @OneToMany(() => GameLog, (gamelog) => gamelog.loserSeq)
    losergameSeq: GameLog[];
}
