/* eslint-disable max-classes-per-file */
import { Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import { EntityRepository, Repository } from 'typeorm';
import { GameData } from '../dto/game-data';
import { GameRecordDto } from '../dto/game-record.dts';

@EntityRepository(GameLog)
export class GameLogRepository extends Repository<GameLog> {
  private readonly logger = new Logger('GameLogRepository');

  async findRecentGameLog(userSeq: number, limit: number): Promise<GameLog[]> {
    this.logger.debug('findRecentGameLog');
    let ret;
    if (limit > 0) { // limit 지정해서 가져올 때
      ret = await this.find({
        where: [
          { topUserSeq: userSeq },
          { btmUserSeq: userSeq },
        ],
        order: {
          createdAt: 'DESC',
        },
        take: limit,
      });
    } else { // limit 제한 없이 가져올 때
      ret = await this.find({
        where: [
          { topUserSeq: userSeq },
          { btmUserSeq: userSeq },
        ],
        order: {
          createdAt: 'DESC',
        },
      });
    }
    return ret;
  }

  async fundUserGameLog(userSeq: number): Promise<GameRecordDto> {
    const [allGames, count] = await this.findAndCount({
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

  async saveInitGame(game:GameData): Promise<number> {
    const { metaData, ruleData } = game;
    const newLog = this.create({
      roomId: metaData.roomId,
      isRankGame: metaData.isRankGame,
      blueUserSeq: metaData.playerBlue.userId,
      redUserSeq: metaData.playerRed.userId,
      blueUserName: metaData.playerBlue.userName,
      redUserName: metaData.playerRed.userName,
      paddleSize: ruleData.paddleSize,
      ballSpeed: ruleData.ballSpeed,
      matchScore: ruleData.matchScore,
    });
    const savedLog = await this.save(newLog);
    return savedLog.gameLogSeq;
  }

  async saveUpdatedGame(metaData, inGameData) {
    const result = await this.update(metaData.gameLogSeq, {
      winnerSeq: inGameData.winnerSeq,
      blueScore: inGameData.scoreBlue,
      redScore: inGameData.scoreRed,
    });
    this.logger.debug(result);
    return result;
  }
}
