import {
  Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
    gameSeq: number;

  @Column()
    roomId: string;

  @Column()
    topUserName: string;

  @Column()
    btmUserName: string;

  @ManyToOne(() => User)
  @JoinColumn()
    topUserSeq: string;

  @ManyToOne(() => User)
  @JoinColumn()
    btmUserSeq: string;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    finishedAt: Date;
}
