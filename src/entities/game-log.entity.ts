import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import GameOption from 'src/enums/mastercode/game-option.enum';
import User from './user.entity';

@Entity()
export default class GameLog {
  @PrimaryGeneratedColumn()
    gameSeq: number;

  @Column()
    roomId: number;

  @Column({ default: false })
    isLadder: boolean;

  @Column()
    winnerSeq: number;

  @Column()
    loserSeq: number;

  @Column()
    option1: GameOption;

  @Column()
    option2: GameOption;

  @Column()
    option3: GameOption;

  @Column()
    createdAt: Date;

  @CreateDateColumn()
    finishedAt: Date;

  @Column({ default: 0 })
    winnerScore: number;

  @Column({ default: 0 })
    loserScore: number;

  @ManyToOne(() => User, (winner) => winner.winnergameSeq)
  @JoinColumn({ name: 'winnerSeq' })
    winner: User;

  @ManyToOne(() => User, (loser) => loser.losergameSeq)
  @JoinColumn({ name: 'loserSeq' })
    loser: User;
}
