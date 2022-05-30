import {
  IsString, IsNotEmpty, IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
    username: string; // FIXME: 디버깅 및 개발단계용

  @ApiProperty({
    description: '채팅방 비밀번호',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
    password: string;
}
