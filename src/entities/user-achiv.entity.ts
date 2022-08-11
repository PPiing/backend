import {
  Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column,
} from 'typeorm';
import Achiv from './achiv.entity';
import User from './user.entity';

@Entity()
export default class UserAchiv {
  @PrimaryGeneratedColumn()
    userAchivSeq: number; // 프로필-업적 시퀀스

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'userSeq' })
  @Column()
    userSeq: number; // 유저 엔티티

  @ManyToOne(() => Achiv, (achiv) => achiv.achivSeq)
  @JoinColumn({ name: 'achivSeq' })
  @Column()
    achivSeq: number; // 업적 엔티티
}
