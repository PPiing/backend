import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
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

  @Column({ default: '' })
    option1: string;

  @Column({ default: '' })
    option2: string;

  @Column({ default: '' })
    option3: string;

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
