import {
  BaseEntity,
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import ChatParticipant from './chat-participant.entity';
// eslint-disable-next-line import/no-cycle
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
