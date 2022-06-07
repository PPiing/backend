import { Socket } from 'socket.io';
import { GameSession } from './game-session';

export interface GameSocket extends Socket {
  session: GameSession;
}
