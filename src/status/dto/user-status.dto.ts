import UserStatus from 'src/enums/mastercode/user-status.enum';

export default class UserStatusDto {
  userSeq: number;

  userStatus: UserStatus;
}
