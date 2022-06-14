import { Injectable, Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import { GameRecordDto } from './dto/game-record.dts';
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
    return this.gameLogRepository.findRecentGameLog(userSeq, limit);
  }

  async findUserGameLog(userSeq: number): Promise<GameRecordDto> {
    return this.gameLogRepository.fundUserGameLog(userSeq);
  }
}
