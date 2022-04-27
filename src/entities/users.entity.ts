import { Entity, JoinColumn, OneToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import RankEntity from './rank.entity';

@Entity()
export default class UserEntity {
  @OneToOne(() => RankEntity, (rank) => rank.userSeq)
  @JoinColumn()
    rankSeq: RankEntity;
}
