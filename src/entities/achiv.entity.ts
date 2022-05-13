import {
  Entity, Column, PrimaryGeneratedColumn, OneToMany,
} from 'typeorm';
import ProfileAchiv from './profile-achiv.entity';

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

  @Column()
    totalScore: string; // 목표달성점수

  @OneToMany(() => ProfileAchiv, (profileAchiv) => profileAchiv.achiv)
    profileAchiv: ProfileAchiv[]; // 프로필 업적 엔티티
}
