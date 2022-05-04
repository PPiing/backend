import PartcAuth from 'src/enums/partc-auth.enum';
import {
  BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
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
    chatSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
    userSeq: number;
}
