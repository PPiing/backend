import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GameDataDto } from './dto/game-data.dto';
import { GameLogDto } from './dto/game-log.dto';
import { GameRecordDto } from './dto/game-record.dts';
import { GameStatus } from './dto/in-game.dto';
import { GameLogRepository } from './repository/game-log.repository';

@Injectable()
export class GameLogService {
  private readonly logger:Logger = new Logger(GameLogService.name);

  constructor(private readonly gameLogRepository: GameLogRepository) {}

  async findGameLogBySeq(seq: number): Promise<GameLogDto> {
    this.logger.debug('findGameLogBySeq');
    const ret = await this.gameLogRepository.findOne(seq);
    if (ret === undefined) {
      throw new BadRequestException(`${seq}는 올바르지 않은 game-log 시퀀스 입니다.`);
    }
    return ret;
  }

  async findRecentGameLog(userSeq: number, limit: number): Promise<GameLogDto[]> {
    this.logger.debug('findRecentGameLog', userSeq, limit);
    return this.gameLogRepository.findRecentGameLog(userSeq, limit);
  }

  async findUserGameLog(userSeq: number): Promise<GameRecordDto> {
    return this.gameLogRepository.fundUserGameLog(userSeq);
  }

  async saveInitGame(game: GameDataDto) {
    return this.gameLogRepository.saveInitGame(game);
  }

  async saveFinishedGame(game: GameDataDto) {
    const { metaData, inGameData } = game;
    if (metaData?.gameLogSeq && inGameData?.status === GameStatus.End) {
      return this.gameLogRepository.saveUpdatedGame(metaData, inGameData);
    }
    return false;
  }
}
