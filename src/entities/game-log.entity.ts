import {
  Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';
import User from './user.entity';
import { Game } from './game.entity';

@Entity()
export default class GameLog {
  @PrimaryGeneratedColumn()
    gameLogSeq: number;

  // [
  //   { name: 'topUser', referencedColumnName: 'topUserSeq' },
  //   { name: 'btmUser', referencedColumnName: 'btmUserSeq' },
  // ] 이렇게 하고 싶은데 안되요 ㅜㅜ
  @OneToOne(() => Game)
  @JoinColumn()
    gameSeq: number;

  @Column()
    gameType: GameType;

  @ManyToOne(() => User)
    winnerSeq: number;

  @Column({ default: 0 })
    topSideScore: number;

  @Column({ default: 0 })
    btmSideScore: number;

  @Column()
    option1: GameOption; // matchScore

  @Column()
    option2: GameOption; // racket size

  @Column()
    option3: GameOption; // ball speed

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
