import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';

@Entity()
export default class FriendsEntity {
  @PrimaryGeneratedColumn()
    friendSeq: number;

  @Column()
    isBlocked: boolean;

  @Column()
    status: string;

  @ManyToOne(() => User, (user) => user.userSeq)
    followerSeq: number;

  @ManyToOne(() => User, (user) => user.userSeq)
    followeeSeq: number;
}
