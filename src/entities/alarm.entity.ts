import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class AlarmEntity {
  @PrimaryGeneratedColumn()
    alsrmSeq: number;

  @Column()
    alarmType: number;

  @Column()
    alarmCode: string;

  @Column()
    read: boolean;

  @Column()
    delete: boolean;

  @Column()
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'receiverSeq' })
    receiverSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'senderSeq' })
    senderSeq: number;
}
