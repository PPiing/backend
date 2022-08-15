import { ApiProperty } from '@nestjs/swagger';
import UserStatus from 'src/enums/mastercode/user-status.enum';

export class SearchUserDto {
  @ApiProperty({
    description: '유저 시퀀스',
    example: 1,
  })
    userSeq: number;

  @ApiProperty({
    description: '유저 닉네임',
    example: 'skim',
  })
    nickName: string;

  @ApiProperty({
    description: '유저 상태',
    enum: ['USST10', 'USST20', 'USST30', 'USST40'],
    example: 'USST10',
  })
    userStatus: UserStatus;

  @ApiProperty({
    description: '유저 이미지',
    example: './img/DefaultProfile.png',
  })
    userImage: string;
}
