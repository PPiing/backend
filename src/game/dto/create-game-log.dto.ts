import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateGameLogDto {
  @IsString()
    roomId: string;

  @IsBoolean()
    isRankGame: boolean;

  @IsNumber()
    blueUserSeq: number;

  @IsNumber()
    redUserSeq: number;

  @IsString()
    blueUserName: string;

  @IsString()
    redUserName: string;

  @IsNumber()
    paddleSize: number;

  @IsNumber()
    ballSpeed: number;

  @IsNumber()
    matchScore: number;
}
