import {
  Entity, PrimaryGeneratedColumn, Column,
} from 'typeorm';

@Entity()
export default class Profile {
  @PrimaryGeneratedColumn()
    profileSeq: number; // 프로필 시퀀스

  @Column()
    userSeq: number; // 유저 시퀀스

  @Column()
    rankSeq: number; // 랭크 시퀀스
}
