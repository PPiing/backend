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
    width: 10, // base width * option.scale (default: 1), 0.5, 1.5;
    height: 100,
    speed: 10,
  };

  ball: Ball = {
    radius: 5, // 반지름
    speed: 1, // base speed * option.scale (default: 5), 4, 7;
  };
}
