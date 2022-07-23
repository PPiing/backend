import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import EventType from 'src/enums/mastercode/event-type.enum';
import ChatParticipant from './chat-participant.entity';
import Chat from './chat.entity';

@Entity()
export class ChatEvent {
  @PrimaryGeneratedColumn()
    eventSeq: number;

  @Column()
    eventType: EventType;

  @ManyToOne(() => ChatParticipant)
  @JoinColumn({ name: 'fromWho' })
    fromWho: ChatParticipant;

  @ManyToOne(() => ChatParticipant)
  @JoinColumn({ name: 'toWho' })
    toWho: ChatParticipant;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chatSeq' })
    chatSeq: Chat;

  @CreateDateColumn({ default: new Date() })
    createdAt: Date;

  @Column({ default: false })
    deletedCheck: boolean;

  @Column({ default: new Date() })
    expiredAt: Date;
}
