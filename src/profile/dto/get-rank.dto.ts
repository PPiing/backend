import { ApiProperty } from '@nestjs/swagger';

export class GetRankDto {
  @ApiProperty({
    description: '랭크 점수',
    example: 50,
  })
    rank_score: number;

  @ApiProperty({
    description: '티어 이름',
    example: 'silver',
  })
    rank_name: string;
}
