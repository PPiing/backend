import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import UserStatus from 'src/enums/mastercode/user-status.enum';

export class GetFriendsDto {
  @ApiProperty({
    description: '유저 아이디',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
    userSeq: number;

  @ApiProperty({
    description: '유지 닉네임',
    example: 'skim',
  })
  @IsString()
  @IsNotEmpty()
    nickname: string;

  @ApiProperty({
    description: '유저 프로필 사진',
    example: './img/DefaultProfile.png',
  })
  @IsString()
  @IsNotEmpty()
    avatarImgUri: string;

  @ApiProperty({
    description: '유저 상태',
    enum: ['USST10', 'USST20', 'USST30', 'USST40'],
    example: 'USST10',
  })
  @IsNotEmpty()
    status: UserStatus;
}
