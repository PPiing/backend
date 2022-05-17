import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
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

  @Column()
    partcAuth: PartcAuth;

  @Column()
    mutedUntil: Date;

  @Column({ default: false })
    isBaned: boolean;

  @CreateDateColumn()
    enteredAt: Date;

  @CreateDateColumn()
    leavedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.chatSeq)
  @JoinColumn({ name: 'chatSeq' })
    chat: Chat;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'userSeq' })
    user: User;
}
