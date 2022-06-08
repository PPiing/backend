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

export class SpecData {
  arena: Arena = {
    width: 500,
    height: 500,
  };

  paddle: Paddle = {
    width: 20, // base width * option.scale (default: 1), 0.5, 1.5;
    height: 10,
    speed: 10,
  };

  ball: Ball = {
    radius: 10,
    speed: 1, // base speed * option.scale (default: 5), 4, 7;
  };
}
