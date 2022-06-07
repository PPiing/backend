import { Injectable, Logger } from '@nestjs/common';
import { GameSession } from './interface/game-session';

@Injectable()
export class GameQueue {
  private readonly logger: Logger = new Logger('GameQueue');

  private normal: Array<GameSession> = [];

  private ladder: Array<GameSession> = [];

  enQueue(client: GameSession, isLadder: string): Promise<GameSession[] | boolean> {
    this.logger.debug(client);
    // TODO: check duplicates
    if (isLadder) {
      return this.addToLadder(client);
    }
    return this.addToNormal(client);
  }

  deQueue(client:GameSession, isLadder:boolean): void {
    if (isLadder) {
      return this.removeFromLadder(client);
    }
    return this.removeFromNormal(client);
  }

  async addToNormal(client: GameSession): Promise<GameSession[] | boolean> {
    // const index = this.normal.indexOf(client);
    // if (index > -1) {
    //   this.logger.error(`${client.userId} is already in normal queue`);
    //   return false;
    // }
    this.normal.push(client);
    if (this.normal.length >= 2) {
      const players: GameSession[] = this.normal.splice(0, 2);
      return players;
    }
    return false;
  }

  async addToLadder(client: GameSession): Promise<GameSession[] | boolean> {
    // const index = this.ladder.indexOf(client);
    // if (index > -1) {
    //   this.logger.error(`${client.userId} is already in ladder queue`);
    //   return false;
    // }
    this.ladder.push(client);
    if (this.ladder.length >= 2) {
      const players: GameSession[] = this.ladder.splice(0, 2);
      return players;
    }
    return false;
  }

  removeFromNormal(client: GameSession) {
    const index = this.normal.indexOf(client);
    if (index > -1) this.normal.splice(index, 1);
    else this.logger.error(`${client.userId} is not in normal queue`);
  }

  removeFromLadder(client: GameSession) {
    const index = this.ladder.indexOf(client);
    if (index > -1) this.ladder.splice(index, 1);
    else this.logger.error(`${client.userId} is not in ladder queue`);
  }
}
