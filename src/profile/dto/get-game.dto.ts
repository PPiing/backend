import { ApiProperty } from '@nestjs/swagger';

export class GetGameDto {
  @ApiProperty({
    description: '승자 이름',
    example: 'skim',
  })
    winner_name: string;

  @ApiProperty({
    description: '패자 이름',
    example: 'kkim',
  })
    loser_name: string;

  @ApiProperty({
    description: '게임 종류',
    example: false,
  })
    game_type: boolean;

  @ApiProperty({
    description: '승자 점수',
    example: 10,
  })
    winner_score: number;

  @ApiProperty({
    description: '승자 점수',
    example: 10,
  })
    loser_score: number;

  @ApiProperty({
    description: '게임 시작 시간',
    example: '2022-07-09-15:38',
  })
    start_time: Date;
}
