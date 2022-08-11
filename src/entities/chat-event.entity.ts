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
  @Column()
    fromWho: number;

  @ManyToOne(() => ChatParticipant)
  @JoinColumn({ name: 'toWho' })
  @Column()
    toWho: number;

  @ManyToOne(() => Chat)
  @JoinColumn({ name: 'chatSeq' })
  @Column()
    chatSeq: number;

  @CreateDateColumn({ default: new Date() })
    createdAt: Date;

  @Column({ default: false })
    deletedCheck: boolean;

  @Column({ default: new Date() })
    expiredAt: Date;
}
