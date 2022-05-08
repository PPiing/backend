import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import User from './user.entity';

@Entity()
export default class GameLog{
    @PrimaryGeneratedColumn()
        gameSeq: number;

    @Column()
        roomId: number;

    @Column()
        isLadder: Boolean;

    @Column()
        option1: number;

    @Column()
        option2: number;

    @Column()
        option3: number;

    @CreateDateColumn({default: new Date()})
        createdAt: Date;

    @CreateDateColumn()
        finishedAt: Date;

    @Column()
        winnerScore: number;

    @Column()
        loserScore: number;

    @ManyToOne(() => User, (winner) => winner.userSeq)
        winnerSeq: number;

    @ManyToOne(() => User, (loser) => loser.userSeq)
        loserSeq: number;
}