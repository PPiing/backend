import { InGameData, RenderData, PaddleDirective } from './in-game.dto';
import { MetaData } from './meta.dto';
import { SpecData } from './spec.dto';
import { RuleDto } from './rule.dto';

export {
  MetaData, SpecData, InGameData, RenderData, PaddleDirective,
};
export class GameData {
  metaData: MetaData;

  ruleData: RuleDto;

  inGameData: InGameData;

  static readonly spec: SpecData = new SpecData();
}
