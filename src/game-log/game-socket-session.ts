/* eslint-disable no-param-reassign */
import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { GameSession } from './interface/game-session';
import { GameSocket } from './interface/game-socket';

@Injectable()
export class GameSocketSession {
  private readonly logger: Logger = new Logger('InMemorySession');

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async joinSession(socket: GameSocket, next: () => any) {
    this.logger.debug(`user ${socket} connected`);
    const { sessionId, userId } = socket.handshake.auth;
    let session: GameSession = null;
    if (sessionId) {
      session = await this.findSession(sessionId);
    } else {
      // if (!userId) return false;
      session = {
        sessionId: randomUUID(),
        userId: 123,
        roomId: null,
        inGame: false,
      };
      this.logger.debug('session', session);
      this.saveSession(session.sessionId, session);
    }
    socket.session = session;
    this.logger.debug(`joining new user id : ${socket.session.userId}`);
    return next();
  }

  async findSession(sessionId: string): Promise<GameSession> {
    const ret: GameSession = await this.cacheManager.get(sessionId);
    return ret;
  }

  saveSession(sessionId: string, session: GameSession) {
    this.cacheManager.set(sessionId, session);
  }

  async removeSession(sessionId: string) {
    const ret = await this.cacheManager.del(sessionId);
    return ret;
  }
}
