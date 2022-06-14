import {
  IsObject, IsString,
} from 'class-validator';
import GameType from 'src/enums/mastercode/game-type.enum';
import { GameSession } from '../interface/game-session';

export class MetaData {
  constructor(
    roomId: string,
    playerTop: GameSession,
    playerBtm: GameSession,
    gameType: GameType,
  ) {
    this.roomId = roomId;
    this.playerTop = playerTop;
    this.playerBtm = playerBtm;
    this.gameType = gameType;
  }

  @IsString()
    roomId: string;

  @IsObject()
    playerTop: GameSession;

  @IsObject()
    playerBtm: GameSession;

  @IsString()
    gameType: GameType;
}
