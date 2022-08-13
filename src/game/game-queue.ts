import { Injectable, Logger } from '@nestjs/common';
import { RuleDto } from './dto/rule.dto';

@Injectable()
export class GameQueue {
  private readonly logger: Logger = new Logger('GameQueue');

  private normalQueue: Array<[any, RuleDto]> = [];

  private ladderQueue: Array<[any, RuleDto]> = [];

  enQueue(client: any, enqueueData: RuleDto) {
    this.logger.debug(client);
    console.log(client, enqueueData);
    const { isRankGame } = enqueueData;

    if (isRankGame === true) {
      return this.addToLadderQueue(client, enqueueData);
    }
    return this.addToNormalQueue(client, enqueueData);
  }

  deQueue(client:any, dequeueData: RuleDto) {
    this.logger.debug(client);
    const { isRankGame } = dequeueData;

    if (isRankGame === true) {
      return this.removeFromLadderQueue(client, dequeueData);
    }
    return this.removeFromNormalQueue(client, dequeueData);
  }

  private async addToNormalQueue(client: any, enqueueData: RuleDto) {
    this.logger.debug('try to add to normal queue');
    const dup = this.normalQueue.find((tuple) => tuple[0] === client && tuple[1] === enqueueData);
    if (!dup) {
      this.logger.debug('addto Nomal', client, 'queue', this.normalQueue);
      this.normalQueue.push([client, enqueueData]);
    }
    if (this.normalQueue.length >= 2) {
      const players: [any, RuleDto][] = this.normalQueue.splice(0, 2);
      console.log(players);
      return players;
    }
    return false;
  }

  private async addToLadderQueue(client: any, enqueueData: RuleDto) {
    this.logger.debug('try to add to ladder queue');
    const dup = this.ladderQueue.find((tuple) => tuple[0] === client && tuple[1] === enqueueData);
    if (!dup) {
      this.logger.debug('addto Ladder', client, 'queue', this.ladderQueue);
      this.ladderQueue.push([client, enqueueData]);
    }
    if (this.ladderQueue.length >= 2) {
      const players: [any, RuleDto][] = this.ladderQueue.splice(0, 2);
      return players;
    }
    return false;
  }

  removeFromNormalQueue(client: any, dequeueData: RuleDto) {
    const index = this.normalQueue.indexOf([client, dequeueData]);
    if (index > -1) this.normalQueue.splice(index, 1);
    else this.logger.error(`${client.userId} is not in normalQueue queue`);
  }

  removeFromLadderQueue(client: any, dequeueData: RuleDto) {
    const index = this.ladderQueue.indexOf([client, dequeueData]);
    if (index > -1) this.ladderQueue.splice(index, 1);
    else this.logger.error(`${client.userId} is not in ladderQueue queue`);
  }
}
