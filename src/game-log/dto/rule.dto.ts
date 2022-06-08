/* eslint-disable max-classes-per-file */
import { PartialType } from '@nestjs/mapped-types';
import GameOption from 'src/enums/mastercode/game-option.enum';

export class RuleData {
  option1: GameOption = GameOption.GLOP10;

  option2: GameOption = GameOption.GLOP20;

  option3: GameOption = GameOption.GLOP40;
}

export class PatchRule extends PartialType(RuleData) {}
