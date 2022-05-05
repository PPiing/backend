import {
  Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Rank {
  @PrimaryGeneratedColumn()
    rankSeq: number; // 랭크 시퀀스

  @Column({ nullable: true })
    rankScore: number; // 랭크 점수

  @Column()
    userSeq: number; // 유저 시퀀스
}
