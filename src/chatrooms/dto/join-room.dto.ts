import {
  IsString, IsNotEmpty, IsOptional,
} from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
    username: string; // FIXME: 디버깅 및 개발단계용

  @IsString()
  @IsOptional()
  @IsNotEmpty()
    password: string;
}
