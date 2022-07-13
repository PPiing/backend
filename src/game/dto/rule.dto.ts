import { IsBoolean, IsNumber, Length } from 'class-validator';

/**
 * TODO: naming 센스있게 바꿔야 할듯. e.g. speed -> ballSpeed
 */
export class RuleDto {
  @IsNumber()
  @Length(1, 10)
    score: number;

  @IsNumber()
    speed: number;

  @IsNumber()
    size: number;

  @IsBoolean()
    isRankGame: boolean;
}
