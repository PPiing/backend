import {
  Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';
import User from './user.entity';

@Entity()
export default class GameLog {
  @PrimaryGeneratedColumn()
    gameLogSeq: number;

  @Column()
    roomId: string;

  @Column()
    gameType: GameType;

  @ManyToOne(() => User)
  @JoinColumn()
    topUserSeq: number;

  @ManyToOne(() => User)
  @JoinColumn()
    btmUserSeq: number;

  @Column()
    topUserName: string;

  @Column()
    btmUserName: string;

  @ManyToOne(() => User)
    winnerSeq: number;

  @Column({ default: 0 })
    topSideScore: number;

  @Column({ default: 0 })
    btmSideScore: number;

  @Column()
    option1: GameOption; // racket size

  @Column()
    option2: GameOption; // ball speed

  @Column()
    option3: GameOption; // match score

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
