import { Injectable, Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import { GameLogRepository } from './game-log.repository';

@Injectable()
export class GameLogService {
  private readonly logger:Logger = new Logger('GameLogService');

  constructor(private readonly gameLogRepository: GameLogRepository) {}

  async findGameLogBySeq(seq: number): Promise<GameLog> {
    this.logger.debug('findGameLogBySeq');
    const ret = await this.gameLogRepository.findOne(seq);
    return ret;
  }

  async findRecentGameLog(userSeq: number, limit: number): Promise<GameLog[] | GameLog> {
    this.logger.debug('findRecentGameLog', userSeq, limit);
    const ret = await this.gameLogRepository.find({
      where: {
        userSeq,
        limit,
      },
    });
    return ret;
  }

  async findUserGameLog(userSeq: number): Promise<{ total: number; win: number; }> {
    const [allGames, count] = await this.gameLogRepository.findAndCount({
      where: [
        { topUserSeq: userSeq },
        { btmUserSeq: userSeq },
      ],
    });
    const winGames = allGames.reduce((prev, wins) => {
      if (wins.winnerSeq === userSeq) return prev + 1;
      return prev;
    }, 0);
    return { total: count, win: winGames };
  }
}
