import UserStatus from 'src/enums/mastercode/user-status.enum';

export class UserDto {
  userSeq: number; // transcendence id

  userId: number;// 42seoul id

  nickName: string;

  email: string;

  secAuthStatus: boolean;

  avatarImgUri: string;

  status: UserStatus;

  deleteStatus: boolean;

  createdAt: Date;

  isLogin: string;

  roomId?: string;

  firstLogin: boolean;
}
