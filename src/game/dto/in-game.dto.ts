/* eslint-disable max-classes-per-file */
import { GameData } from './game-data';

export interface Position {
  x: number;
  y: number;
}
export type Vector = Position;

export interface MovementInfo {
  position: Position;
  velocity: Vector;
}

export const enum PaddleDirective {
  UP = 1,
  STOP = 0,
  DOWN = -1,
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

  scoreBlue = 0;

  scoreRed = 0;

  paddleBlue: MovementInfo = {
    position: {
      x: GameData.spec.arena.width / 2,
      y: 10,
    },
    velocity: {
      x: 1,
      y: 0,
    },
  };

  paddleRed: MovementInfo = {
    position: {
      x: GameData.spec.arena.width / 2,
      y: GameData.spec.arena.height - 10,
    },
    velocity: {
      x: 1,
      y: 0,
    },
  };

  ball: MovementInfo = {
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
      paddleBlue: this.paddleBlue.position,
      paddleRed: this.paddleRed.position,
    };
  }

  get scoreData(): ScoreData {
    return {
      blue: this.scoreBlue,
      red: this.scoreRed,
    };
  }
}

export class RenderData {
  ball: Position;

  paddleBlue: Position;

  paddleRed: Position;
}
export class ScoreData {
  blue = 0;

  red = 0;
}
