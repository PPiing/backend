import { Injectable, Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import { GameData } from './dto/game-data';
import { GameRecordDto } from './dto/game-record.dts';
import { GameStatus } from './dto/in-game.dto';
import { GameLogRepository } from './repository/game-log.repository';

@Injectable()
export class GameLogService {
  private readonly logger:Logger = new Logger(GameLogService.name);

  constructor(private readonly gameLogRepository: GameLogRepository) {}

  async findGameLogBySeq(seq: number): Promise<GameLog> {
    this.logger.debug('findGameLogBySeq');
    const ret = await this.gameLogRepository.findOne(seq);
    return ret;
  }

  async findRecentGameLog(userSeq: number, limit: number): Promise<GameLog[]> {
    this.logger.debug('findRecentGameLog', userSeq, limit);
    return this.gameLogRepository.findRecentGameLog(userSeq, limit);
  }

  async findUserGameLog(userSeq: number): Promise<GameRecordDto> {
    return this.gameLogRepository.fundUserGameLog(userSeq);
  }

  async saveInitGame(game: GameData) {
    return this.gameLogRepository.saveInitGame(game);
  }

  async saveFinishedGame(game: GameData) {
    const { metaData, inGameData } = game;
    this.logger.debug('saveFinishedGame');
    if (metaData?.gameLogSeq && (
      inGameData?.status === GameStatus.End || inGameData?.status === GameStatus.Ending)) {
      const result = await this.gameLogRepository.saveUpdatedGame(metaData, inGameData);
      return result;
    }
    return false;
  }
}
