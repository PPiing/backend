import {
  Entity, Column, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Achiv {
  @PrimaryGeneratedColumn()
    achivSeq: number; // 업적 시퀀스

  @Column()
    achivTitle: string; // 업적

  @Column()
    condition: string; // 조건

  @Column()
    imgUri: string; // 이미지

  @Column({ nullable: true })
    totalScore: string; // 목표달성점수
}
