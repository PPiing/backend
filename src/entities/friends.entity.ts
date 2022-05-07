import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import User from './users.entity';

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
