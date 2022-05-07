import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import RankEntity from './rank.entity';
import GameLog from './gamelog.entity';

@Entity()
export default class UserEntity {
  @PrimaryGeneratedColumn()
    userSeq: number;
  @OneToOne(() => RankEntity, (rank) => rank.userSeq)
  @JoinColumn()
    rankSeq: RankEntity;
  //여기서 게임로그로 유저의 시퀸스를 넘기는데
  //이겼는지 졌는지를 어캐 알지?
  //플레이어1(본인), 플레이어2(상대), 점수비교해서 큰쪽으로 승패유무를 결정해야하나
  //근데 그게 실제 구현이 되나
  @OneToMany(() => GameLog, (gamelog) => gamelog.winnerSeq)
  @OneToMany(() => GameLog, (gamelog) => gamelog.loserSeq)
    gameSeq: GameLog[];
  }