import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString,
} from 'class-validator';
import { randomUUID } from 'crypto';

export class GameLogDto {
  @ApiProperty({
    description: '게임 로그 시퀀스(PK)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
    gameLogSeq: number;

  @ApiProperty({
    description: '게임 후 생성된 소켓 룸 ID',
    example: randomUUID(),
  })
  @IsString()
    roomId: string;

  @ApiProperty({
    description: '랭크 게임유무',
    example: false,
  })
  @IsBoolean()
    isRankGame: boolean;

  @ApiProperty({
    description: '블루 유저 시퀀스',
    example: 1,
  })
  @IsNumber()
    blueUserSeq: number;

  @ApiProperty({
    description: '레드 유저 시퀀스',
    example: 2,
  })
  @IsNumber()
    redUserSeq: number;

  @ApiProperty({
    description: '블루 유저 이름',
    example: 'skim',
  })
  @IsString()
    blueUserName: string;

  @ApiProperty({
    description: '레드 유저 이름',
    example: 'jinbekim',
  })
  @IsString()
    redUserName: string;

  @ApiProperty({
    description: '이긴 유저 시퀀스',
    example: 1,
  })
  @IsNumber()
    winnerSeq: number;

  @ApiProperty({
    description: '블루 유저 점수',
    example: 10,
  })
  @IsNumber()
    blueScore: number;

  @ApiProperty({
    description: '레드 유저 점수',
    example: 5,
  })
  @IsNumber()
    redScore: number;

  @ApiProperty({
    description: '라켓 사이즈',
    example: 3,
  })
  @IsNumber()
    paddleSize: number;

  @ApiProperty({
    description: '볼 스피드',
    example: 10,
  })
  @IsNumber()
    ballSpeed: number;

  @ApiProperty({
    description: '승리 조건 점수',
    example: 10,
  })
  @IsNumber()
    matchScore: number;

  @ApiProperty({
    description: '게임 시작 시간',
    example: '2022-06-16T00:26:58.205Z',
  })
  @IsDate()
    createdAt: Date;

  @ApiProperty({
    description: '마지막 업데이트 시간',
    example: '2022-06-16T00:26:58.205Z',
  })
  @IsDate()
    updatedAt: Date;
}
