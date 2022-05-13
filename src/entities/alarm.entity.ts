import AlarmType from 'src/enums/alarm-type.enum';
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class Alarm {
  @PrimaryGeneratedColumn()
    alsrmSeq: number;

  @Column({ default: AlarmType.NEW_DM })
    alarmType: AlarmType;

  @Column()
    alarmCode: string;

  @Column({ default: false })
    read: boolean;

  @Column({ default: false })
    delete: boolean;

  @CreateDateColumn()
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'receiverSeq' })
    receiverSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'senderSeq' })
    senderSeq: number;
}
