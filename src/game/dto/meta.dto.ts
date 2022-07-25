import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject, IsString,
} from 'class-validator';
import { randomUUID } from 'crypto';
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

  @ApiProperty({
    description: '게임 로그 시퀀스(PK)',
    example: 1,
  })
  @IsNumber()
    gameLogSeq: number;

  @ApiProperty({
    description: '게임 소켓 룸 ID',
    example: randomUUID(),
  })
  @IsString()
    roomId: string;

  @IsObject()
    playerBlue: GameSession;

  @IsObject()
    playerRed: GameSession;

  @ApiProperty({
    description: '랭크 게임 유무',
    example: false,
  })
  @IsBoolean()
    isRankGame: boolean;
}
