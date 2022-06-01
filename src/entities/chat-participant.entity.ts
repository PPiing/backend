import PartcAuth from 'src/enums/mastercode/partc-auth.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatEvent } from './chat-event.entity';
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

  @DeleteDateColumn()
    leavedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.chatSeq)
  @JoinColumn({ name: 'chatSeq' })
    chat: Chat;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'userSeq' })
    user: User;

  @OneToMany(() => ChatEvent, (chatEvent) => chatEvent.fromWho)
    fromWho: ChatEvent[];

  @OneToMany(() => ChatEvent, (chatEvent) => chatEvent.toWho)
    toWho: ChatEvent[];
}
