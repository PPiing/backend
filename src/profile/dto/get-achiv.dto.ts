import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsNotEmpty, IsNumber, IsString,
} from 'class-validator';

export class GetAchivDto {
  @ApiProperty({
    description: '업적 시퀀스 (고유 ID)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
    achiv_seq: number;

  @ApiProperty({
    description: '업적 이름',
    example: 'Score50',
  })
  @IsString()
  @IsNotEmpty()
    achiv_title: string;

  @ApiProperty({
    description: '업적 이미지',
    example: './img/achiv/score50.png',
  })
  @IsString()
    achiv_image: string;

  @ApiProperty({
    description: '업적 달성 여부',
    example: 'true',
  })
  @IsBoolean()
  @IsNotEmpty()
    achiv_complete: boolean;
}
