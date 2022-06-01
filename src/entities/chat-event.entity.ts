import {
  Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import ChatParticipant from './chat-participant.entity';
import Chat from './chat.entity';

const enum ChatEventType {
  BAN = 'BAN',
  KICK = 'KICK',
  MUTE = 'MUTE',
}

@Entity()
export class ChatEvent {
  @PrimaryGeneratedColumn()
    eventSeq: number;

  @Column()
    eventType: ChatEventType;

  @ManyToOne(() => ChatParticipant)
  @JoinColumn({ name: 'fromWho' })
    fromWho: ChatParticipant;

  @ManyToOne(() => ChatParticipant)
  @JoinColumn({ name: 'toWho' })
    toWho: ChatParticipant;

  @ManyToOne(() => Chat)
    chatSeq: Chat;

  @CreateDateColumn({ default: new Date() })
    createdAt: Date;

  @DeleteDateColumn({ default: new Date() })
    deletedAt: Date;
}
