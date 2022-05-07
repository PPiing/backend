import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import User from './user.entity';

@Entity()
export default class GameLog{
    @PrimaryGeneratedColumn()
        gameSeq: number; //primary key
    //방아이디
    @Column()
        roomId: number;
    //래더여부
    @Column()
        isLadder: Boolean;
    //옵션1
    @Column()
        option1: number;
    //옵션2
    @Column()
        option2: number;
    //옵션3
    @Column()
        option3: number;
    //생성시간
    @CreateDateColumn({default: new Date()})
        createdAt: Date;
    //종료시간
    @CreateDateColumn()
        finishedAt: Date;
    //승자점수
    @Column()
        winnerScore: number;
    //패자점수
    @Column()
        loserScore: number;
    //승자 유저 시퀸스
    @ManyToOne(() => User, (winner) => winner.userSeq)
        winnerSeq: number;
    //패자 유저 시퀸스
    @ManyToOne(() => User, (loser) => loser.userSeq)
        loserSeq: number;
}