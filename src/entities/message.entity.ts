import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';
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
  @Column()
    chatSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'userSeq' })
  @Column()
    userSeq: number;
}
