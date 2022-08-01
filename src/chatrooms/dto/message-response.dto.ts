import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiPropertyOptional({
    description: '메시지 고유 ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
    msgSeq: number;

  @ApiProperty({
    description: '채팅방 고유 ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
    chatSeq: number;

  @ApiProperty({
    description: '유저 ID',
    example: 1,
  })
  @IsString()
  @IsNotEmpty()
    userSeq: number;

  @ApiProperty({
    description: '채팅 내용',
    example: '안녕하세요',
  })
  @IsString()
  @IsNotEmpty()
    msg: string;

  @ApiProperty({
    description: '닉네임',
    example: 'joopark',
  })
  @IsString()
  @IsNotEmpty()
    nickname: string;

  @ApiProperty({
    description: '메시지 생성 시간',
    example: '2020-01-01T00:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
    createAt: Date;
}
