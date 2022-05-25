import RelationStatus from 'src/enums/mastercode/relation-status.enum';
import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class Friends {
  @PrimaryGeneratedColumn()
    friendSeq: number;

  @Column({ default: false })
    isBlocked: boolean;

  @Column()
    status: RelationStatus;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'followerSeq' })
    followerSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
  @JoinColumn({ name: 'followeeSeq' })
    followeeSeq: number;
}
