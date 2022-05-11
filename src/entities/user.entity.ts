import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import ChatParticipant from './chat-participant.entity';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
    userSeq: number;

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.userSeq)
    partcSeq: ChatParticipant[];
}
