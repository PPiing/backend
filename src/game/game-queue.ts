import { Injectable, Logger } from '@nestjs/common';
import { GameSession } from './dto/game-session.dto';
import { RuleDto } from './dto/rule.dto';

@Injectable()
export class GameQueue {
  private readonly logger: Logger = new Logger('GameQueue');

  private normalQueue: Array<[GameSession, RuleDto]> = [];

  private ladderQueue: Array<[GameSession, RuleDto]> = [];

  enQueue(client: GameSession, enqueueData: RuleDto) {
    this.logger.debug(client);
    const { isRankGame } = enqueueData;

    if (isRankGame === true) {
      return this.addToLadderQueue(client, enqueueData);
    }
    return this.addToNormalQueue(client, enqueueData);
  }

  deQueue(client:GameSession, dequeueData: RuleDto) {
    this.logger.debug(client);
    const { isRankGame } = dequeueData;

    if (isRankGame === true) {
      return this.removeFromLadderQueue(client, dequeueData);
    }
    return this.removeFromNormalQueue(client, dequeueData);
  }

  private async addToNormalQueue(client: GameSession, enqueueData: RuleDto) {
    const index = this.normalQueue.indexOf([client, enqueueData]);
    if (index === -1) {
      this.normalQueue.push([client, enqueueData]);
    }
    if (this.normalQueue.length >= 2) {
      const players: [GameSession, RuleDto][] = this.normalQueue.splice(0, 2);
      return players;
    }
    return false;
  }

  private async addToLadderQueue(client: GameSession, enqueueData: RuleDto) {
    const index = this.ladderQueue.indexOf([client, enqueueData]);
    if (index === -1) {
      this.ladderQueue.push([client, enqueueData]);
    }
    if (this.ladderQueue.length >= 2) {
      const players: [GameSession, RuleDto][] = this.ladderQueue.splice(0, 2);
      return players;
    }
    return false;
  }

  removeFromNormalQueue(client: GameSession, dequeueData: RuleDto) {
    const index = this.normalQueue.indexOf([client, dequeueData]);
    if (index > -1) this.normalQueue.splice(index, 1);
    else this.logger.error(`${client.userId} is not in normalQueue queue`);
  }

  removeFromLadderQueue(client: GameSession, dequeueData: RuleDto) {
    const index = this.ladderQueue.indexOf([client, dequeueData]);
    if (index > -1) this.ladderQueue.splice(index, 1);
    else this.logger.error(`${client.userId} is not in ladderQueue queue`);
  }
}
