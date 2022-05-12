import PartcAuth from 'src/enums/partc-auth.enum';
import {
  Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import Chat from './chat.entity';
import User from './user.entity';

@Entity()
export default class ChatParticipant {
  @PrimaryGeneratedColumn()
    partcSeq: number;

  @Column()
    userSeq: number;

  @Column()
    chatSeq: number;

  @Column({ default: PartcAuth.NONE })
    partcAuth: PartcAuth;

  @Column()
    mutedUntil: Date;

  @Column()
    isBaned: boolean;

  @CreateDateColumn({ default: new Date() })
    enteredAt: Date;

  @DeleteDateColumn()
    deletedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.chatSeq)
  @JoinColumn({ name: 'chatSeq' })
    chat: Chat;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'userSeq' })
    user: User;
}
