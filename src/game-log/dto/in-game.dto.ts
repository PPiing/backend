/* eslint-disable max-classes-per-file */
import { GameData } from './game-data';

export interface Position {
  x: number;
  y: number;
}

export interface Objective extends Position {
  velocity: Position;
}

export const enum PaddleDirective {
  LEFT = -1,
  STOP = 0,
  RIGHT = 1,
}

export const enum GameStatus {
  Ready = 'ready',
  Playing = 'playing',
  End = 'end',
}

export class InGameData {
  frame = 0;

  status: GameStatus = GameStatus.Ready;

  winner: number = null;

  scoreTop = 0;

  scoreBtm = 0;

  paddleTop: { position: Position, velocity: Position } = {
    position: {
      x: GameData.spec.arena.width / 2,
      y: 10,
    },
    velocity: {
      x: 1,
      y: 0,
    },
  };

  paddleBtm: { position: Position, velocity: Position } = {
    position: {
      x: GameData.spec.arena.width / 2,
      y: GameData.spec.arena.height - 10,
    },
    velocity: {
      x: 1,
      y: 0,
    },
  };

  ball: { position: Position, velocity: Position } = {
    position: {
      x: GameData.spec.arena.width / 2,
      y: GameData.spec.arena.height / 2,
    },
    velocity: {
      x: 0,
      y: 1, // NOTE: 번갈아 가면서 나와야 함.
    },
  };

  get renderData(): RenderData {
    return {
      ball: this.ball.position,
      paddleTop: this.paddleTop.position,
      paddleBtm: this.paddleBtm.position,
    };
  }

  get score(): ScoreData {
    return {
      scoreTop: this.scoreTop,
      scoreBtm: this.scoreBtm,
    };
  }
}

export class RenderData {
  ball: Position;

  paddleTop: Position;

  paddleBtm: Position;
}
export class ScoreData {
  scoreTop = 0;

  scoreBtm = 0;
}
