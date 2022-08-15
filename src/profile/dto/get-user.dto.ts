import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsNotEmpty, IsNumber, IsString,
} from 'class-validator';
import UserStatus from 'src/enums/mastercode/user-status.enum';

export class GetUserDto {
  @ApiProperty({
    description: '유저 시퀀스 (고유 ID)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
    userSeq: number;

  @ApiProperty({
    description: '유저 닉네임',
    example: 'skim',
  })
  @IsString()
  @IsNotEmpty()
    userName: string;

  @ApiProperty({
    description: '유저 이메일',
    example: 'skim@student.42seoul.kr',
  })
  @IsString()
  @IsNotEmpty()
    userEmail: string;

  @ApiProperty({
    description: '유저 상태',
    enum: ['USST10', 'USST20', 'USST30', 'USST40'],
    example: 'USST10',
  })
  @IsNotEmpty()
    userStatus: UserStatus;

  @ApiProperty({
    description: '유저 프로필 사진',
    example: './img/DefaultProfile.png',
  })
  @IsString()
  @IsNotEmpty()
    userImage: string;

  @ApiProperty({
    description: '2차 인증 여부',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
    userSecAuthStatus: boolean;

  // @IsBoolean()
  // isFriend: boolean;

  // @IsBoolean()
  // isBlocked: boolean;
}
