import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class TargetUserDto {
  @ApiProperty({
    description: '대상 유저 시퀀스(PK)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
    targetSeq: number;
}
