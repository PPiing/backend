import {
  IsBoolean, IsEmail, IsNotEmpty, IsString, IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
    nickName: string;

  @IsEmail()
  @IsNotEmpty()
    email: string;

  @IsBoolean()
  @IsNotEmpty()
    secAuthStatus: boolean;

  @IsUrl()
  @IsNotEmpty()
    avatarImgUri: string;
}
