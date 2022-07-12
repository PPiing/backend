import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';

export class GameLogDto {
  gameLogSeq: number;

  gameType: GameType;

  topUserSeq: number;

  btmUserSeq: number;

  winnerSeq: number;

  topSideScore: number;

  btmSideScore: number;

  matchScoe: number;

  barSize: number;

  option1: GameOption; // racket size

  option2: GameOption; // ball speed

  option3: GameOption; // match score

  topUserName: string;

  btmUserName: string;

  roomId: string;

  createdAt: Date;

  updatedAt: Date;
}
