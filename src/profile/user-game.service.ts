import { Injectable, Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import { GameLogService } from 'src/game-log/game-log.service';
import { GetGameDto } from './dto/get-game.dto';

@Injectable()
export class UserGameService {
  private readonly logger:Logger = new Logger(UserGameService.name);

  constructor(
    private readonly gameLogService: GameLogService,
  ) {}

  /**
   * 유저에 대한 게임 전적 가져오기
   *
   * @param userSeq 유저 PK
   * @return 게임 전적 list
   */
  async geUserGame(userSeq: number): Promise<GetGameDto[]> {
    this.logger.debug(`getUserGane : ${userSeq}`);

    const allGames : GameLog[] = await this.gameLogService.findRecentGameLog(userSeq, -1);
    const result: GetGameDto[] = [];
    allGames.forEach((game) => {
      if (game.winnerSeq === game.topUserSeq) {
        result.push({
          winner_name: game.topUserName,
          loser_name: game.btmUserName,
          game_type: game.gameType,
          winner_score: game.topSideScore,
          loser_score: game.btmSideScore,
          start_time: game.createdAt,
        });
      } else if (game.winnerSeq === game.btmUserSeq) {
        result.push({
          winner_name: game.btmUserName,
          loser_name: game.topUserName,
          game_type: game.gameType,
          winner_score: game.btmSideScore,
          loser_score: game.topSideScore,
          start_time: game.createdAt,
        });
      }
    });

    return result;
  }
}
