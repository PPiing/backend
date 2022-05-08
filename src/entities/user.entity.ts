import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import GameLog from './gamelog.entity';

@Entity()
export default class UserEntity {
  @PrimaryGeneratedColumn()
    userSeq: number;

  @OneToMany(() => GameLog, (gamelog) => gamelog.winnerSeq)
    winnergameSeq: GameLog[];

  @OneToMany(() => GameLog, (gamelog) => gamelog.loserSeq)
    losergameSeq: GameLog[];

  }