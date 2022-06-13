/* eslint-disable max-classes-per-file */
import GameLog from 'src/entities/game-log.entity';
import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(GameLog)
export class GameLogRepository extends Repository<GameLog> {}

export class MockGameLogRepository {
  constructor(private logs: GameLog[]) {
    this.logs.push(
      {
        gameLogSeq: 1,
        gameSeq: 1,
        gameType: GameType.NORMAL,
        winnerSeq: 1,
        topSideScore: 5,
        btmSideScore: 2,
        option1: GameOption.GLOP10,
        option2: GameOption.GLOP20,
        option3: GameOption.GLOP40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        gameLogSeq: 2,
        gameSeq: 2,
        gameType: GameType.NORMAL,
        winnerSeq: 2,
        topSideScore: 3,
        btmSideScore: 5,
        option1: GameOption.GLOP10,
        option2: GameOption.GLOP20,
        option3: GameOption.GLOP40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        gameLogSeq: 3,
        gameSeq: 3,
        gameType: GameType.NORMAL,
        winnerSeq: 4,
        topSideScore: 1,
        btmSideScore: 5,
        option1: GameOption.GLOP10,
        option2: GameOption.GLOP20,
        option3: GameOption.GLOP40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );
  }

  /**
   * @return all game logs
   */
  async find(): Promise<GameLog[]> {
    return this.logs;
  }

  /**
   * @return game log
   */
  async findOneBySeq(seq: number): Promise<GameLog> {
    return this.logs.find((val) => val.gameSeq === seq);
  }

  async save(log: GameLog): Promise<GameLog | void> {
    this.logs.push(log);
    return log;
  }
}
