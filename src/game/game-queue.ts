import { Injectable, Logger } from '@nestjs/common';
import GameType from 'src/enums/mastercode/game-type.enum';
import { GameSession } from './dto/game-session.dto';
import { DequeueDto, QueueDto } from './dto/queue.dto';

@Injectable()
export class GameQueue {
  private readonly logger: Logger = new Logger('GameQueue');

  private normalQueue: Array<[GameSession, QueueDto]> = [];

  private ladderQueue: Array<[GameSession, QueueDto]> = [];

  enQueue(client: GameSession, enqueueData: QueueDto) {
    this.logger.debug(client);
    const { isRankGame } = enqueueData;

    if (isRankGame === GameType.LADDER) {
      return this.addToLadderQueue(client, enqueueData);
    }
    return this.addToNormalQueue(client, enqueueData);
  }

  deQueue(client:GameSession, dequeueData: DequeueDto) {
    this.logger.debug(client);
    const { isRankGame } = dequeueData;

    if (isRankGame === GameType.LADDER) {
      return this.removeFromLadderQueue(client, dequeueData);
    }
    return this.removeFromNormalQueue(client, dequeueData);
  }

  private async addToNormalQueue(client: GameSession, enqueueData: QueueDto) {
    const index = this.normalQueue.indexOf([client, enqueueData]);
    if (index === -1) {
      this.normalQueue.push([client, enqueueData]);
    }
    if (this.normalQueue.length >= 2) {
      const players: [GameSession, QueueDto][] = this.normalQueue.splice(0, 2);
      return players;
    }
    return false;
  }

  private async addToLadderQueue(client: GameSession, enqueueData: QueueDto) {
    const index = this.ladderQueue.indexOf([client, enqueueData]);
    if (index === -1) {
      this.ladderQueue.push([client, enqueueData]);
    }
    if (this.ladderQueue.length >= 2) {
      const players: [GameSession, QueueDto][] = this.ladderQueue.splice(0, 2);
      return players;
    }
    return false;
  }

  removeFromNormalQueue(client: GameSession, dequeueData: DequeueDto) {
    const index = this.normalQueue.indexOf([client, dequeueData]);
    if (index > -1) this.normalQueue.splice(index, 1);
    else this.logger.error(`${client.userId} is not in normalQueue queue`);
  }

  removeFromLadderQueue(client: GameSession, dequeueData: DequeueDto) {
    const index = this.ladderQueue.indexOf([client, dequeueData]);
    if (index > -1) this.ladderQueue.splice(index, 1);
    else this.logger.error(`${client.userId} is not in ladderQueue queue`);
  }
}
