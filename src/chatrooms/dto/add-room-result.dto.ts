import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddRoomResultDto {
  @ApiProperty({
    description: '채팅방 ID',
  })
    chatSeq: number;

  @ApiPropertyOptional({
    description: '채팅방 이름',
    example: '푸주홍의 등산크럽',
  })
    chatName?: string;
}
