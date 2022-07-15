import {
  IsBoolean,
  IsNumber,
  IsObject, IsString,
} from 'class-validator';
import { GameSession } from './game-session.dto';

export class MetaData {
  constructor(
    roomId: string,
    playerBlue: GameSession,
    playerRed: GameSession,
    isRankGame: boolean,
  ) {
    this.roomId = roomId;
    this.playerBlue = playerBlue;
    this.playerRed = playerRed;
    this.isRankGame = isRankGame;
  }

  @IsNumber()
    gameLogSeq: number;

  @IsString()
    roomId: string;

  @IsObject()
    playerBlue: GameSession;

  @IsObject()
    playerRed: GameSession;

  @IsBoolean()
    isRankGame: boolean;
}
