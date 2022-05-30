import {
  IsString, IsNotEmpty, IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiPropertyOptional({
    description: '채팅방 비밀번호',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
    password: string;
}
