import { Test, TestingModule } from '@nestjs/testing';
import { GameLogController } from './game-log.controller';

describe('GameLogController', () => {
  let controller: GameLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameLogController],
    }).compile();

    controller = module.get<GameLogController>(GameLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
