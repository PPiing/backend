import { Injectable, Logger } from '@nestjs/common';
import { RuleDto } from './dto/rule.dto';

@Injectable()
export class GameQueue {
  private readonly logger: Logger = new Logger('GameQueue');

  private normalQueue: Array<[any, RuleDto]> = [];

  private ladderQueue: Array<[any, RuleDto]> = [];

  enQueue(client: any, enqueueData: RuleDto) {
    this.logger.debug('enqueue', client.request.user);
    const { isRankGame } = enqueueData;

    if (isRankGame === true) {
      return this.addToLadderQueue(client, enqueueData);
    }
    return this.addToNormalQueue(client, enqueueData);
  }

  deQueue(client:any, dequeueData: RuleDto) {
    this.logger.debug('dequeue', client.request.user);
    const { isRankGame } = dequeueData;

    if (isRankGame === true) {
      return this.removeFromLadderQueue(client, dequeueData);
    }
    return this.removeFromNormalQueue(client, dequeueData);
  }

  private async addToNormalQueue(client: any, enqueueData: RuleDto) {
    this.logger.debug('try to add to normal queue');
    const dup = this.normalQueue.find((tuple) => {
      console.log('add', tuple[0].request.user.userSeq, client.request.user.userSeq);
      return tuple[0].request.user.userSeq === client.request.user.userSeq;
    });
    if (!dup) {
      this.normalQueue.push([client, enqueueData]);
    } else {
      return null;
    }
    if (this.normalQueue.length >= 2) {
      const players: [any, RuleDto][] = this.normalQueue.splice(0, 2);
      return players;
    }
    return false;
  }

  private async addToLadderQueue(client: any, enqueueData: RuleDto) {
    this.logger.debug('try to add to ladder queue');
    const dup = this.ladderQueue.find((tuple) => {
      console.log('add', tuple[0].request.user.userSeq, client.request.user.userSeq);
      return tuple[0].request.user.userSeq === client.request.user.userSeq;
    });
    if (!dup) {
      this.ladderQueue.push([client, enqueueData]);
    } else {
      return null;
    }
    if (this.ladderQueue.length >= 2) {
      const players: [any, RuleDto][] = this.ladderQueue.splice(0, 2);
      return players;
    }
    return false;
  }

  removeFromNormalQueue(client: any, dequeueData: RuleDto) {
    const dup = this.normalQueue.findIndex(
      (tuple) => {
        console.log('dequeue', tuple[0].request.user.userSeq, client.request.user.userSeq);
        return tuple[0].request.user.userSeq === client.request.user.userSeq;
      },
    );
    if (!dup) this.normalQueue.splice(dup, 1);
    else this.logger.error(`${client.request.user.userSeq} is not in normalQueue queue`);
  }

  removeFromLadderQueue(client: any, dequeueData: RuleDto) {
    const dup = this.ladderQueue.findIndex(
      (tuple) => {
        console.log('dequeue', tuple[0].request.user.userSeq, client.request.user.userSeq);
        return tuple[0].request.user.userSeq === client.request.user.userSeq;
      },
    );
    if (!dup) this.ladderQueue.splice(dup, 1);
    else this.logger.error(`${client.request.user.userSeq} is not in ladderQueue queue`);
  }
}
