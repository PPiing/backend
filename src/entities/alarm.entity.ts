import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class Alarm {
  @PrimaryGeneratedColumn()
    alarmSeq: number;

  @Column()
    alarmType: AlarmType;

  @Column()
    alarmCode: AlarmCode;

  @Column({ default: false })
    read: boolean;

  @Column({ default: false })
    delete: boolean;

  @CreateDateColumn()
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'receiverSeq' })
  @Column()
    receiverSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'senderSeq' })
  @Column()
    senderSeq: number;
}
