import {
  Controller, Get, Logger, Param, Query, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { CheckLogin } from 'src/guards/check-login.guard';
import { GameDataDto } from './dto/game-data.dto';
import { GameLogDto } from './dto/game-log.dto';
import { GameLogService } from './game-log.service';
import { GameService } from './game.service';

@ApiTags('게임')
@Controller('game-log')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(CheckLogin)
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
  @ApiOperation({ summary: '게임 로그를 조회합니다', description: '게임 로그 시퀀스를 입력하면 해당 로그를 리턴합니다.' })
  @ApiResponse({ status: 200, type: GameLogDto, description: '게임 로그 조회 성공' })
  @ApiResponse({ status: 400, description: '게임 로그 조회 실패' })
  @ApiParam({
    name: 'seq', type: Number, example: 1, description: '조회하고자 하는 유저 시퀀스',
  })
  @Get(':seq')
  findGameLogBySeq(@Param('seq') seq:number): Promise<GameLogDto> {
    this.logger.debug('/game-log/:seq', seq);
    return this.gameLogService.findGameLogBySeq(seq);
  }

  /**
   * 전달한 유저 시퀀스와 limit을 각각 패스파라미터와 쿼리파라미터로 전달받고
   * 해당 유저의 최근 게임로그 limit 갯수를 반환합니다.
   * @param userSeq 유저 시퀀스
   * @param limit 몇개나
   * @returns 해당 유저의 최근 게임로그
   */
  @ApiOperation({ summary: 'GameLog를 제한하여 조회합니다.', description: 'userSeq의 로그를 limit 만큼 조회하여 반환합니다.' })
  @ApiResponse({ status: 200, type: [GameLogDto], description: '게임 로그 조회 성공' })
  @ApiResponse({ status: 400, description: '게임 로그 조회 실패' })
  @ApiParam({
    name: 'seq', type: Number, example: 1, description: '조회하고자 하는 유저 시퀀스',
  })
  @ApiParam({
    name: 'limit', type: Number, example: 5, description: '조회하고자 하고 싶은 로그의 갯수',
  })
  @Get('recent/user/:userSeq')
  findRecentGameLog(
    @Param('userSeq') userSeq: number,
      @Query('limit') limit: number,
  ): Promise<GameLogDto[]> {
    return this.gameLogService.findRecentGameLog(userSeq, limit);
  }

  @ApiOperation({ summary: '현재 진행 중인 게임 조회', description: '현재 userSeq가 진행 중인 게임의 정보를 반환합니다.' })
  @ApiResponse({ status: 200, type: GameDataDto, description: '진행 중인 게임 조회 성공' })
  @Get('current/user/:userSeq')
  findCurrentGame(@Param('userSeq') userSeq: number): GameDataDto {
    return this.gameService.findCurrentGame(userSeq);
  }

  // NOTE : game-log/{seq} 와 똑같습니다.
  @Get('user/:userSeq')
  findUserGameLog(@Param('userSeq') userSeq: number) : Promise<{ total: number, win: number }> {
    return this.gameLogService.findUserGameLog(userSeq);
  }

  // NOTE: rank (mmr) 점수는 Rank 모듈에서?
}
