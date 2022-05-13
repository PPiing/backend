import ChatType from 'src/enums/chat-type.enum';
import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import ChatParticipant from './chat-participant.entity';
import Message from './message.entity';

@Entity()
export default class Chat {
  @PrimaryGeneratedColumn()
    chatSeq: number;

  @Column({ default: ChatType.PUBLIC })
    chatType: ChatType;

  @Column({ unique: true })
    chatName: string;

  @Column({ default: '' })
    password: string;

  @Column({ default: false })
    isDirected: boolean;

  @OneToMany(() => Message, (message) => message.chatSeq)
    msgSeq: number;

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.chatSeq)
    partcSeq: ChatParticipant[];
}
