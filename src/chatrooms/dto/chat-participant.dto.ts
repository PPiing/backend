import { ApiProperty } from '@nestjs/swagger';
import PartcAuth from 'src/enums/mastercode/partc-auth.enum';

export class ChatParticipantDto {
  @ApiProperty({
    description: '채팅방의 참여자 ID (유저 ID와 다름)',
  })
    partcSeq: number;

  @ApiProperty({
    description: '유저 ID',
  })
    userSeq: number;

  @ApiProperty({
    description: '채팅방 ID',
  })
    chatSeq: number;

  @ApiProperty({
    description: '유저 권한',
    type: PartcAuth,
  })
    partcAuth: PartcAuth;

  @ApiProperty({
    description: '채팅 참여일자',
  })
    enteredAt: Date;

  @ApiProperty({
    description: '나간 시간',
  })
    leavedAt: Date;
}
