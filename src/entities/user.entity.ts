import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import RankEntity from './rank.entity';
import GameLog from './gamelog.entity';

@Entity()
export default class UserEntity {
  @PrimaryGeneratedColumn()
    userSeq: number;
  @OneToOne(() => RankEntity, (rank) => rank.userSeq)
  @JoinColumn()
    rankSeq: RankEntity;

  @OneToMany(() => GameLog, (gamelog) => gamelog.winnerSeq)
    winnergameSeq: GameLog[];
  @OneToMany(() => GameLog, (gamelog) => gamelog.loserSeq)
    losergameSeq: GameLog[];
  }