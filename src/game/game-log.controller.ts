import {
  Controller, Get, Logger, Param, Query,
} from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import { GameLogService } from './game-log.service';
import { GameService } from './game.service';

@Controller('game-log')
export class GameLogController {
  private readonly logger: Logger = new Logger('GameLogController');

  constructor(
    private readonly gameLogService: GameLogService,
    private readonly gameService: GameService,
  ) {}

  /**
   * 찾고자 하는 게임로그의 시퀀스를 입력하면 해당 로그를 리턴합니다.
   * @param seq 게임로그 시퀀스
   * @returns 해당 게임로그
   */
  @Get(':seq')
  async findGameLogBySeq(@Param('seq') seq:number): Promise<GameLog> {
    this.logger.debug('/game-log/:seq', seq);
    const ret = await this.gameLogService.findGameLogBySeq(seq);
    return ret;
  }

  /**
   * 전달한 유저 시퀀스와 limit을 각각 패스파라미터와 쿼리파라미터로 전달받고
   * 해당 유저의 최근 게임로그 limit 갯수를 반환합니다.
   * @param userSeq 유저 시퀀스
   * @param limit 몇개나
   * @returns 해당 유저의 최근 게임로그
   */
  @Get('recent/user/:userSeq')
  async findRecentGameLog(
    @Param('userSeq') userSeq: number,
      @Query('limit') limit: number,
  ): Promise<GameLog[]> {
    const ret = await this.gameLogService.findRecentGameLog(userSeq, limit);
    return ret;
  }

  @Get('user/:userSeq')
  async findUserGameLog(@Param('userSeq') userSeq: number) : Promise<{ total: number, win: number }> {
    const ret = await this.gameLogService.findUserGameLog(userSeq);
    return ret;
  }
}
