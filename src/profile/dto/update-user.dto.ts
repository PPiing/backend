import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsEmail, IsNotEmpty, IsString,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: '유저 닉네임',
    example: 'skim',
  })
  @IsString()
  @IsNotEmpty()
    nickName: string;

  @ApiProperty({
    description: '유저 이메일',
    example: 'skim@student.42seoul.kr',
  })
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty({
    description: '2차 인증 여부',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
    secAuthStatus: boolean;

  @ApiProperty({
    description: '유저 프로필 사진',
    example: './img/DefaultProfile.png',
  })
  @IsString()
  @IsNotEmpty()
    avatarImgUri: string;
}
