import {
  IsBoolean,
  IsNumber,
  IsObject, IsString,
} from 'class-validator';
import { UserDto } from 'src/user/dto/user.dto';

export class MetaData {
  constructor(
    roomId: string,
    playerBlue: UserDto,
    playerRed: UserDto,
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
    playerBlue: UserDto;

  @IsObject()
    playerRed: UserDto;

  @IsBoolean()
    isRankGame: boolean;
}
