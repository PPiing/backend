import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import ChatParticipant from './chat-participant.entity';
import GameLog from './gamelog.entity';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
    userSeq: number;

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.userSeq)
    partcSeq: ChatParticipant[];
  
  @OneToMany(() => GameLog, (gamelog) => gamelog.winnerSeq)
    winnergameSeq: GameLog[];

  @OneToMany(() => GameLog, (gamelog) => gamelog.loserSeq)
    losergameSeq: GameLog[];
}
