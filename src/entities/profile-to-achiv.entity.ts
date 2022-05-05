import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class ProfileToAchiv {
  @PrimaryGeneratedColumn()
    profileToAchivSeq: number; // 프로필-업적 시퀀스

  @Column()
    profileSeq: boolean; // 프로필 시퀀스

  @Column()
    achivSeq: string; // 업적 시퀀스

  @Column()
    isRepresent: boolean; // 대표업적

  @Column({ nullable: true })
    progress: number; // 달성도

  @CreateDateColumn()
    createdAt: Date; // 생성일

  @UpdateDateColumn()
    updatedAt: Date; // 수정일
}
