import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
    userSeq: number; // 유저 시퀀스

  @Column()
    userId: number; // 42 ID

  @Column()
    nickName: string; // 닉네임

  @Column()
    email: string; // 이메일

  @Column()
    secAuthStatuc: boolean; // 이차인증 여부

  @Column({ nullable: true })
    avatarImgUri: string; // 프로필 이미지 URI

  @Column()
    status: boolean; // 접속 여부

  @Column()
    deleteStatus: boolean; // 삭제 여부

  @CreateDateColumn()
    createdAt: Date; // 생성일
}
