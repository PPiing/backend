import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class GameLog {
  @PrimaryGeneratedColumn()
    gameSeq: number;

  @Column()
    roomId: number;

  @Column()
    isLadder: boolean;

  @Column()
    winnerSeq: number;

  @Column()
    loserSeq: number;

  @Column()
    option1: number;

  @Column()
    option2: number;

  @Column()
    option3: number;

  @CreateDateColumn({ default: new Date() })
    createdAt: Date;

  @UpdateDateColumn()
    finishedAt: Date;

  @Column()
    winnerScore: number;

  @Column()
    loserScore: number;

  @ManyToOne(() => User, (winner) => winner.winnergameSeq)
  @JoinColumn({ name: 'winnerSeq' })
    winner: User;

  @ManyToOne(() => User, (loser) => loser.losergameSeq)
  @JoinColumn({ name: 'loserSeq' })
    loser: User;
}
