import {
  Column, Entity, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import UserEntity from './users.entity';

@Entity()
export default class RankEntity {
  @PrimaryGeneratedColumn()
    rankSeq: number;

  @Column()
    rankScore: number;

  @OneToOne(() => UserEntity, (user) => user.rankSeq)
    userSeq: UserEntity;
}
