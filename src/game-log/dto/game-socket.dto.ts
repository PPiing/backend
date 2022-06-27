import { Socket } from 'socket.io';
import { GameSession } from './game-session.dto';

export class GameSocket extends Socket {
  session: GameSession;
}
