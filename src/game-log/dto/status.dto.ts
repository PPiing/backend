import { IsNotEmpty, IsString } from 'class-validator';

export class StatusDto {
  @IsNotEmpty()
  @IsString()
    status: string;
}
