import { Test, TestingModule } from '@nestjs/testing';
import { GameLogService } from './game-log.service';

describe('GameLogService', () => {
  let service: GameLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameLogService],
    }).compile();

    service = module.get<GameLogService>(GameLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
