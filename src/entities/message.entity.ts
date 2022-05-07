import {
  BaseEntity,
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import ChatParticipant from './chat-participant.entity';
import Chat from './chat.entity';

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
    msgSeq: number;

  @Column()
    message: string;

  @CreateDateColumn({ default: new Date() })
    createdAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.msgSeq)
    chatSeq: number;

  @ManyToOne(() => ChatParticipant, (chatParticipant) => chatParticipant.partcSeq)
    partctSeq: number;
}
