import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class Rank {
  @PrimaryGeneratedColumn()
    rankSeq: number; // 랭크 시퀀스

  @Column({ default: 0 })
    rankScore: number; // 랭크 점수

  @Column()
    userSeq: number; // 유저 시퀀스

  @OneToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'userSeq', referencedColumnName: 'userSeq' })
    user: User; // 유저 엔티티
}
