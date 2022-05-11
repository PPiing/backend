import PartcAuth from 'src/enums/partc-auth.enum';
import {
  BaseEntity, Column, CreateDateColumn,
  DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import Chat from './chat.entity';
import User from './user.entity';

@Entity()
export default class ChatParticipant extends BaseEntity {
  @PrimaryGeneratedColumn()
    partcSeq: number;

  @Column({ default: PartcAuth.NONE })
    partcAuth: PartcAuth;

  @Column({ nullable: true })
    mutedUntil: Date;

  @Column()
    isBaned: boolean;

  @CreateDateColumn({ default: new Date() })
    enteredAt: Date;

  @DeleteDateColumn()
    deletedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.chatSeq)
  @JoinColumn({ name: 'chatSeq' })
    chatSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'partcSeq' })
    userSeq: number;
}
