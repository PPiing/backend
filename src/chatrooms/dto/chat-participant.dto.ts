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
    description: '유저 ID',
    type: PartcAuth,
  })
    partcAuth: PartcAuth;

  @ApiProperty({
    description: '뮤트 종료시간',
  })
    mutedUntil: Date;

  @ApiProperty({
    description: '강퇴 여부',
  })
    isBaned: boolean;

  @ApiProperty({
    description: '채팅 참여일자',
  })
    enteredAt: Date;

  @ApiProperty({
    description: '나간 시간',
  })
    leavedAt: Date;
}
