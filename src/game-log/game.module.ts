import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameLogRepository, MockGameLogRepository } from './game-log.repository';
import { GameQueue } from './game-queue';
import { SimulationService } from './simulation.service';
import { GameSocketSession } from './game-socket-session';
import { GameLogController } from './game-log.controller';
import { GameLogService } from './game-log.service';

const GameRepositories = [
  {
    provide: GameLogRepository,
    useValue: MockGameLogRepository,
  },
];

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // TypeOrmModule.forFeature([GameRepository, GameLogRepository]),
  ],
  providers: [
    GameService,
    GameGateway,
    GameQueue,
    SimulationService,
    GameSocketSession,
    GameLogService,
    ...GameRepositories,
  ],
  controllers: [GameLogController],
  exports: [GameGateway],
})
export class GameModule {}
