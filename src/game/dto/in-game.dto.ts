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
  ScoreBlue = 'scoreBlue',
  ScoreRed = 'scoreRed',
  Ending = 'ending',
}

export class InGameData {
  frame = 0;

  status: GameStatus = GameStatus.Ready;

  winnerSeq: number = null;

  scoreBlue = 0;

  scoreRed = 0;

  paddleBlue: MovementInfo = {
    position: {
      x: (GameData.spec.arena.width / 2) * (-1) + 10,
      y: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
  };

  paddleRed: MovementInfo = {
    position: {
      x: (GameData.spec.arena.width / 2) - 10,
      y: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
  };

  ball: MovementInfo = {
    position: {
      x: 0,
      y: 0,
    },
    velocity: {
      x: 1,
      y: 0,
    },
  };

  get renderData(): RenderData {
    Math.round(this.ball.position.x);
    Math.round(this.ball.position.y);
    Math.round(this.paddleBlue.position.x);
    Math.round(this.paddleBlue.position.y);
    Math.round(this.paddleRed.position.x);
    Math.round(this.paddleRed.position.y);

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
