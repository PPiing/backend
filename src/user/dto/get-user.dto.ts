import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import UserStatus from 'src/enums/mastercode/user-status.enum';

export class GetUserDto {
  @ApiProperty({
    description: '유저 닉네임',
    example: 'skim',
  })
  @IsString()
  @IsNotEmpty()
    userName: string;

  @ApiProperty({
    description: '유저 닉네임',
    example: 'skim@student.42seoul.kr',
  })
  @IsString()
  @IsNotEmpty()
    userEmail: string;

  @ApiProperty({
    description: '유저 닉네임',
    enum: ['USST10', 'USST20', 'USST30', 'USST40'],
    example: 'skim',
  })
  @IsNotEmpty()
    userStatus: UserStatus;

  @ApiProperty({
    description: '유저 닉네임',
    example: './img/defaultProfile.jpg',
  })
  @IsString()
  @IsNotEmpty()
    userImage: string;

  // @IsBoolean()
  // isFriend: boolean;

  // @IsBoolean()
  // isBlocked: boolean;
}
