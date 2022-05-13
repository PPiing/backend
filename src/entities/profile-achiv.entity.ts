import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import Achiv from './achiv.entity';
import Profile from './profile.entity';

@Entity()
export default class ProfileAchiv {
  @PrimaryGeneratedColumn()
    profileAchivSeq: number; // 프로필-업적 시퀀스

  @Column()
    profileSeq: boolean; // 프로필 시퀀스

  @Column()
    achivSeq: string; // 업적 시퀀스

  @Column({ default: false })
    isRepresent: boolean; // 대표업적

  @Column({ default: 0 })
    progress: number; // 달성도

  @CreateDateColumn()
    createdAt: Date; // 생성일

  @UpdateDateColumn()
    updatedAt: Date; // 수정일

  @ManyToOne(() => Profile, (profile) => profile.profileAchiv)
  @JoinColumn({ name: 'profileSeq' })
    profile: Profile; // 프로필 엔티티

  @ManyToOne(() => Achiv, (achiv) => achiv.profileAchiv)
  @JoinColumn({ name: 'achivSeq' })
    achiv: Achiv; // 업적 엔티티
}
