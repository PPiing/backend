import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber, IsString, IsUUID,
} from 'class-validator';
import { randomUUID } from 'crypto';

/** TODO: add userName in session */
export class GameSession {
  @ApiProperty({
    description: '유저의 세션 ID',
    example: randomUUID(),
  })
  @IsUUID()
    sessionId: string;

  @ApiProperty({
    description: '유저 시퀀스(PK)',
    example: 1,
  })
  @IsNumber()
    userId: number;

  @ApiProperty({
    description: '유저가 진행중인 게임 소켓 룸 ID',
    example: randomUUID(),
  })
  @IsString()
    roomId: string;

  @ApiProperty({
    description: '유저 이름',
    example: 'skim',
  })
  @IsString()
    userName: string;
}
