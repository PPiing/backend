import { IsNumber } from 'class-validator';

export class GameRecordDto {
  @IsNumber()
    total: number;

  @IsNumber()
    win: number;
}
