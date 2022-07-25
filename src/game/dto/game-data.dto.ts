import { ApiProperty } from '@nestjs/swagger';
import { InGameData, RenderData, PaddleDirective } from './in-game.dto';
import { MetaData } from './meta.dto';
import { SpecData } from './spec.dto';
import { RuleDto } from './rule.dto';

export {
  MetaData, SpecData, InGameData, RenderData, PaddleDirective,
};
export class GameDataDto {
  @ApiProperty({
    description: '게임 정보',
    example: MetaData,
  })
    metaData: MetaData;

  @ApiProperty({
    description: '게임 룰 정보',
    example: RuleDto,
  })
    ruleData: RuleDto;

  // TODO : 좀 더 확인해 볼 것
  @ApiProperty({
    description: '게임 진행 중 일 때 필요한 정보',
    example: InGameData,
  })
    inGameData: InGameData;

  @ApiProperty({
    description: '게임 진행 중 일 때 필요한 정보',
    example: SpecData,
  })
  static readonly spec: SpecData = new SpecData();
}
