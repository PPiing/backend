import { IsNumber, IsString } from 'class-validator';
import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';

export class CreateGameLogDto {
  @IsNumber()
    gameSeq: number;

  @IsString()
    gameType: GameType;

  @IsNumber()
    topSideScore: number;

  @IsNumber()
    btmSideScore: number;

  @IsNumber()
    winner: number;

  @IsString()
    option1: GameOption;

  @IsString()
    option2: GameOption;

  @IsString()
    option3: GameOption;
}
