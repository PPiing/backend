import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';
import { ScheduleModule } from '@nestjs/schedule';
import { GameLogRepository } from './repository/game-log.repository';
import { GameLogService } from './game-log.service';
import { GameQueue } from './game-queue';
import { GameService } from './game.service';
import { SimulationService } from './simulation.service';
import { MockGameLogRepository } from './repository/mock/mock.game-log.repository';

describe('GameModule', () => {
  let gameLogService: GameLogService;
  let gameService: GameService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
      ],
      providers: [
        GameLogService,
        {
          provide: getRepositoryToken(GameLogRepository),
          useClass: MockGameLogRepository,
        },
        GameService,
        GameQueue,
        SimulationService,
      ],
    }).compile();

    gameLogService = app.get<GameLogService>(GameLogService);
    gameService = app.get<GameService>(GameService);
  });

  describe('GameService', () => {
    it('should be instantiated', () => {
      expect(gameService).toBeInstanceOf(GameService);
    });
    it('findCurrentGame', () => {
      expect(gameService.findCurrentGame(3)).toBeUndefined();
    });
  });

  describe('GameLogService', () => {
    it('should be instantiated', () => {
      expect(gameLogService).toBeInstanceOf(GameLogService);
    });
    it('findGameLogBySeq', async () => {
      expect(await gameLogService.findGameLogBySeq(1)).toMatchObject({
        gameLogSeq: 1,
        roomId: '1',
        topUserName: 'user1',
        btmUserName: 'user2',
        topUserSeq: 1,
        btmUserSeq: 2,
        gameType: GameType.NORMAL,
        winnerSeq: 1,
        topSideScore: 5,
        btmSideScore: 2,
        option1: GameOption.GLOP10,
        option2: GameOption.GLOP20,
        option3: GameOption.GLOP40,
        createdAt: '2022-06-16T00:26:58.205Z',
        updatedAt: '2022-06-16T00:26:58.205Z',
      });
    });
    it('findRecentGameLog', async () => {
      expect(await gameLogService.findRecentGameLog(1, 2)).toMatchObject([{
        gameLogSeq: 1,
        roomId: '1',
        topUserName: 'user1',
        btmUserName: 'user2',
        topUserSeq: 1,
        btmUserSeq: 2,
        gameType: GameType.NORMAL,
        winnerSeq: 1,
        topSideScore: 5,
        btmSideScore: 2,
        option1: GameOption.GLOP10,
        option2: GameOption.GLOP20,
        option3: GameOption.GLOP40,
        createdAt: '2022-06-16T00:26:58.205Z',
        updatedAt: '2022-06-16T00:26:58.205Z',
      }]);
    });
    it('findUserGameLog', async () => {
      expect(await gameLogService.findUserGameLog(1)).toEqual(
        {
          total: 1,
          win: 1,
        },
      );
    });
  });
});
