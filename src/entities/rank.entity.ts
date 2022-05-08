import {
  Column, Entity, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';

import UserEntity from './user.entity';

@Entity()
export default class RankEntity {
  @PrimaryGeneratedColumn()
    rankSeq: number;

  @Column()
    rankScore: number;

  @OneToOne(() => UserEntity, (user) => user.rankSeq)
    userSeq: UserEntity;
}
