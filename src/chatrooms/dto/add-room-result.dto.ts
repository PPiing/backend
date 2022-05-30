import {
  IsNotEmpty, IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddRoomResult {
  @ApiProperty({
    description: '채팅방 ID',
  })
  @IsNumber()
  @IsNotEmpty()
    chatSeq: number;

  @ApiProperty({
    description: '채팅방 이름',
    example: '푸주홍의 등산크럽',
  })
  @IsNumber()
  @IsNotEmpty()
    chatName: string;
}
