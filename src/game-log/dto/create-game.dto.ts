import { IsNumber, IsString } from 'class-validator';

export class CreateGameDto {
  @IsString()
    roomId: string;

  @IsString()
    topUserName: string;

  @IsString()
    btmUserName: string;

  @IsNumber()
    topUserSeq: number;

  @IsNumber()
    btmUserSeq: number;
}
