/* eslint-disable max-classes-per-file */
import { Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(GameLog)
export class GameLogRepository extends Repository<GameLog> {}

export class MockGameLogRepository {
  private readonly logger: Logger = new Logger('MockGameLogRepository');

  logs: GameLog[] = [];

  constructor() {
    this.logger.debug('MockGameLogRepository constructor');
    this.logs.push(
      {
        gameLogSeq: 1,
        roomId: '1',
        topUserName: 'user1',
        btmUserName: 'user2',
        topUserSeq: 1,
        btmUserSeq: 2,
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
        roomId: '2',
        topUserName: 'user2',
        btmUserName: 'user3',
        topUserSeq: 2,
        btmUserSeq: 3,
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
        roomId: '3',
        topUserName: 'user3',
        btmUserName: 'user4',
        topUserSeq: 3,
        btmUserSeq: 4,
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
    this.logger.debug('find');
    return this.logs;
  }

  /**
   * @return game log
   */
  async findOne(seq: number): Promise<GameLog> {
    this.logger.debug('findOne seq: ', seq);
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of Object.entries(this.logs)) {
      if (val.gameLogSeq === seq) {
        return this.logs[key];
      }
    }
    return this.logs[0];
  }

  async save(log: GameLog): Promise<GameLog | void> {
    this.logs.push(log);
    return log;
  }
}
