import GameOption from 'src/enums/mastercode/game-option.enum';
import { GameData } from '../dto/game-data';

export type BallDisplacement = {
  dx : number,
  dy : number
};

/**
 * 매 프레임 마다 공의 위치를 계산해 return 한다.
 * @param game game data
 * @return BallDisplacement
 */
export const calculateBallDisplacement = (game: GameData) : BallDisplacement => {
  const { inGameData: { ball }, ruleData: { option2 } } = game;

  let ballSpeedByGameOption;

  /* TODO(jinbekim) : adjust ball speed degree */
  switch (option2) {
    case GameOption.GLOP30:
      ballSpeedByGameOption = 3;
      break;
    case GameOption.GLOP31:
      ballSpeedByGameOption = 5;
      break;
    case GameOption.GLOP32:
      ballSpeedByGameOption = 7;
      break;
    default:
      throw new Error('save unacceptable gameoption in ballspeed option2');
  }

  return {
    dx: ball.velocity.x * GameData.spec.ball.speed * ballSpeedByGameOption,
    dy: ball.velocity.y * GameData.spec.ball.speed * ballSpeedByGameOption,
  };
};
