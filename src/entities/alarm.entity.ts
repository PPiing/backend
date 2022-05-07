import {
	Column, Entity, ManyToOne, PrimaryGeneratedColumn,
  } from 'typeorm';
  // eslint-disable-next-line import/no-cycle
  import User from './users.entity';

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
	  receiverSeq: number;

	@ManyToOne(() => User, (user) => user.userSeq)
	  senderSeq: number;
  }
