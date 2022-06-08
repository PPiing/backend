import { InGameData, RenderData, PaddleDirective } from './in-game.dto';
import { MetaData } from './meta.dto';
import { RuleData, PatchRule } from './rule.dto';
import { SpecData } from './spec.dto';
import { ReadyData } from './ready.dto';

export {
  MetaData, RuleData, SpecData, InGameData, RenderData, PatchRule, ReadyData, PaddleDirective,
};
export class GameData {
  metaData: MetaData;

  ruleData: RuleData;

  inGameData: InGameData;

  static readonly spec: SpecData = new SpecData();
}
