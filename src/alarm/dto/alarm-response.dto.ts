import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsString } from 'class-validator';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';

export class AlarmResponseDto {

  @ApiProperty({
    description: '알람 고유 ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  alarmSeq: number;

  @ApiProperty({
    description: '알람을 보낸 유저 ID',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  from: number;

  @ApiProperty({
    description: '알람 타입',
    type: AlarmType,
  })
  @IsEnum(AlarmType)
  @IsNotEmpty()
  type: AlarmType;

  @ApiProperty({
    description: '알람 세부 타입',
    type: AlarmCode,
  })
  @IsEnum(AlarmCode)
  @IsNotEmpty()
  code: AlarmCode;
}