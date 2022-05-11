import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import Alarm from './alarm.entity';
import ChatParticipant from './chat-participant.entity';
import Friends from './friends.entity';
import GameLog from './gamelog.entity';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
    userSeq: number; // 유저 시퀀스

  @Column()
    userId: number; // 42 ID

  @Column()
    nickName: string; // 닉네임

  @Column()
    email: string; // 이메일

  @Column()
    secAuthStatuc: boolean; // 이차인증 여부

  @Column({ nullable: true })
    avatarImgUri: string; // 프로필 이미지 URI

  @Column()
    status: boolean; // 접속 여부

  @Column()
    deleteStatus: boolean; // 삭제 여부

  @CreateDateColumn()
    createdAt: Date; // 생성일

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
