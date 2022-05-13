import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import ChatParticipant from './chat-participant.entity';
import Chat from './chat.entity';

@Entity()
export default class Message {
  @PrimaryGeneratedColumn()
    msgSeq: number;

  @Column()
    message: string;

  @CreateDateColumn()
    createdAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.msgSeq)
  @JoinColumn({ name: 'chatSeq' })
    chatSeq: number;

  @ManyToOne(() => ChatParticipant, (chatParticipant) => chatParticipant.partcSeq)
  @JoinColumn({ name: 'partcSeq' })
    partctSeq: number;
}
