/* eslint-disable max-classes-per-file */
import { PartialType } from '@nestjs/mapped-types';
import GameOption from 'src/enums/mastercode/game-option.enum';

export class RuleData {
  option1: GameOption = GameOption.GLOP21; // paddle size 보통

  option2: GameOption = GameOption.GLOP31; // ball speed 보통

  option3: GameOption = GameOption.GLOP41; // match score 3점
}

export class PatchRule extends PartialType(RuleData) {}
