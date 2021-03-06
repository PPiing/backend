import {
  Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany,
} from 'typeorm';
import Rank from './rank.entity';
import User from './user.entity';
import UserAchiv from './user-achiv.entity';

@Entity()
export default class Profile {
  @PrimaryGeneratedColumn()
    profileSeq: number; // 프로필 시퀀스

  @Column()
    userSeq: number; // 유저 시퀀스

  @Column()
    rankSeq: number; // 랭크 시퀀스

  @OneToOne(() => Rank, (rank) => rank.rankSeq)
  @JoinColumn({ name: 'rankSeq', referencedColumnName: 'rankSeq' })
    rank: Rank; // 랭크 엔티티

  @OneToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'userSeq', referencedColumnName: 'userSeq' })
    user: User; // 유저 엔티티

  @OneToMany(() => UserAchiv, (userAchiv) => userAchiv.userAchivSeq)
    userAchiv: UserAchiv[]; // 프로필 업적 엔티티
}
