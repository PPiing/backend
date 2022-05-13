import {
  IsString, IsEmail, IsNumber, IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  @IsNotEmpty()
    userId: number;

  @IsString()
  @IsNotEmpty()
    nickName: string;

  @IsEmail()
  @IsNotEmpty()
    email: string;
}
