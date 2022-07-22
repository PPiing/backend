import { Injectable, Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import { GameLogService } from 'src/game/game-log.service';
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
  async getUserGame(userSeq: number): Promise<GetGameDto[]> {
    this.logger.debug(`getUserGane : ${userSeq}`);

    const allGames : GameLog[] = await this.gameLogService.findRecentGameLog(userSeq, -1);
    const result: GetGameDto[] = [];
    allGames.forEach((game) => {
      if (game.winnerSeq === game.blueUserSeq) {
        result.push({
          winner_name: game.blueUserName,
          loser_name: game.redUserName,
          game_type: game.isRankGame,
          winner_score: game.blueScore,
          loser_score: game.redScore,
          start_time: game.createdAt,
        });
      } else if (game.winnerSeq === game.redUserSeq) {
        result.push({
          winner_name: game.redUserName,
          loser_name: game.blueUserName,
          game_type: game.isRankGame,
          winner_score: game.redScore,
          loser_score: game.blueScore,
          start_time: game.createdAt,
        });
      }
    });

    return result;
  }
}
