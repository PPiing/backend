export interface Arena {
  width: number;
  height: number;
}

export interface Ball {
  radius: number;
  speed: number;
}

export interface Paddle {
  width: number;
  height: number;
  speed: number;
}

/**
 * All @widths ans @heights are based on the Arena view of the ceiling.
 * @update 2022.06.27
 */
export class SpecData {
  arena: Arena = {
    width: 700,
    height: 500,
  };

  paddle: Paddle = {
    width: 10,
    height: 100,
    speed: 2,
  };

  ball: Ball = {
    radius: 5,
    speed: 2,
  };
}
