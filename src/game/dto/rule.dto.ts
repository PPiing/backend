import {
  IsBoolean, IsNumber, Max, Min,
} from 'class-validator';

/**
 * TODO(jinbekim): naming 센스있게 바꿔야 할듯. e.g. speed -> ballSpeed
 * 값을 어떻게 받을지 정해야 할듯
 * score는 상관없지만
 * speed나 size는 기존에 디폴트를 정해 놓고 전달받은 값을 곱할지
 * 아니면 바로 해당 스피드로 적용할지
 * 1. 전자는 위험 부담이 낮고
 * 2. 후자는 데이터를 전달 받을때 철저히 검증해야 비정상적인 게임 진행을 맞을 수 있을듯.
 */
export class RuleDto {
  @IsNumber()
  @Min(1)
  @Max(10)
    matchScore = 5;

  @IsNumber()
  @Min(0.8)
  @Max(1.2)
    ballSpeed = 1;

  @IsNumber()
  @Min(0.5)
  @Max(1.5)
    paddleSize = 1;

  @IsBoolean()
    isRankGame = false;
}
