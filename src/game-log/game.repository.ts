/* eslint-disable max-classes-per-file */

import { Game } from 'src/entities/game.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {}

export class MockGameRepository {
  constructor(private logs: Game[]) {
    this.logs.push(
      {
        gameSeq: 1,
        roomId: 'room1',
        topUserName: 'user1',
        btmUserName: 'user2',
        topUserSeq: 1,
        btmUserSeq: 2,
        createdAt: new Date(),
        finishedAt: new Date(),
      },
      {
        gameSeq: 2,
        roomId: 'room2',
        topUserName: 'user2',
        btmUserName: 'user3',
        topUserSeq: 3,
        btmUserSeq: 4,
        createdAt: new Date(),
        finishedAt: new Date(),
      },
      {
        gameSeq: 3,
        roomId: 'room4',
        topUserName: 'user4',
        btmUserName: 'user5',
        topUserSeq: 4,
        btmUserSeq: 5,
        createdAt: new Date(),
        finishedAt: new Date(),
      },
    );
  }

  async find(): Promise<Game[] | void> {
    return this.logs;
  }

  async findOneBySeq(seq: number): Promise<Game | void> {
    const game = await this.logs.find((val) => val.gameSeq === seq);
    return game;
  }

  async save(game: Game): Promise<Game | void> {
    this.logs.push(game);
    return game;
  }
}
