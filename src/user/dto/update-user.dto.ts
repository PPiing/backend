import {
  IsBoolean, IsEmail, IsString, IsUrl,
} from 'class-validator';
import UserStatus from 'src/enums/mastercode/user-status.enum';

export class UpdateUserDto {
  @IsString()
    nickName: string;

  @IsEmail()
    email: string;

  @IsBoolean()
    secAuthStatuc: boolean;

  @IsString()
    status: UserStatus; // mastercode -> string

  @IsUrl()
    avatarImgUri: string;
}
