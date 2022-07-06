import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { GetAchivDto } from './get-achiv.dto';
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
}
