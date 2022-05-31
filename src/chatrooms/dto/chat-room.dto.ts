import {
  IsString, IsNotEmpty, IsBoolean, IsEnum, IsOptional,
} from 'class-validator';
import ChatType from 'src/enums/mastercode/chat-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRoomDto {
  /**
   * CHTP10 : 개인 채팅방 (DM)
   * CHTP20 : 단체 채팅방 (public)
   * CHTP30 : 단체 채팅방 (protected)
   * CHTP40 : 비밀 채팅방 (private)
   */
  @ApiProperty({
    description: '채팅방 종류 (마스터코드)',
    enum: ['CHTP10', 'CHTP20', 'CHTP30', 'CHTP40'],
    example: 'CHTP20',
  })
  @IsEnum(ChatType)
  @IsNotEmpty()
    chatType: ChatType;

  @ApiProperty({
    description: '채팅방 이름', // DM인 경우 'DM-1-2' 과 같이 이름이 지정됨
    example: '푸주홍의 등산크럽',
  })
  @IsString()
  @IsNotEmpty()
    chatName: string; // NOTE: dm인 경우는 없어도 될 듯...

  @ApiProperty({
    description: '채팅방 비밀번호',
    example: '1q2w3e4r!',
  })
  @IsString()
  @IsOptional()
    password: string;

  @ApiProperty({
    description: '디엠 여부',
  })
  @IsBoolean()
  @IsNotEmpty()
    isDirected: boolean;
}
