import UserStatus from 'src/enums/mastercode/user-status.enum';

export class UserDto {
  userSeq: number;

  userId: number;

  nickName: string;

  email: string;

  secAuthStatus: boolean;

  avatarImgUri: string;

  status: UserStatus;

  deleteStatus: boolean;

  createdAt: Date;
}
