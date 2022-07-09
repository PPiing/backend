import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { GetAchivDto } from './get-achiv.dto';
import { GetGameDto } from './get-game.dto';
import { GetRankDto } from './get-rank.dto';
import { GetUserDto } from './get-user.dto';

export class GetProfileDto {
  @ApiProperty({
    description: '유저 정보',
    example: GetUserDto,
  })
  @IsNotEmpty()
    user_info : GetUserDto;

  @ApiProperty({
    description: '업적 정보 리스트',
    example: GetAchivDto,
  })
  @IsNotEmpty()
    achiv_info : GetAchivDto[];

  @ApiProperty({
    description: '랭크 정보',
    example: GetRankDto,
  })
  @IsNotEmpty()
    rank_info: GetRankDto;

  @ApiProperty({
    description: '게임 업적',
    example: GetGameDto,
  })
  @IsNotEmpty()
    game_log: GetGameDto[];
}