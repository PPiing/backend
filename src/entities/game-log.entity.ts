import {
  Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class GameLog {
  @PrimaryGeneratedColumn()
    gameLogSeq: number;

  @Column()
    roomId: string;

  @Column()
    isRankGame: boolean;

  @ManyToOne(() => User)
  @JoinColumn()
    blueUserSeq: number;

  @ManyToOne(() => User)
  @JoinColumn()
    redUserSeq: number;

  @Column()
    blueUserName: string;

  @Column()
    redUserName: string;

  @ManyToOne(() => User)
    winnerSeq: number;

  @Column({ default: 0 })
    blueScore: number;

  @Column({ default: 0 })
    redScore: number;

  @Column()
    paddleSize: number;

  @Column()
    ballSpeed: number;

  @Column()
    matchScore: number;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
