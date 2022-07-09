import {
  Entity, Column, PrimaryGeneratedColumn, OneToMany,
} from 'typeorm';
import UserAchiv from './user-achiv.entity';

@Entity()
export default class Achiv {
  @PrimaryGeneratedColumn()
    achivSeq: number; // 업적 시퀀스

  @Column()
    achivTitle: string; // 업적

  @Column()
    achivImgUri: string; // 이미지

  @Column()
    totalScore: number; // 목표달성점수

  @OneToMany(() => UserAchiv, (userAchiv) => userAchiv.userAchivSeq)
    userAchiv: UserAchiv[]; // 프로필 업적 엔티티
}
