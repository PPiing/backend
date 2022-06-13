import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameRepository, MockGameRepository } from './game.repository';
import { GameLogRepository, MockGameLogRepository } from './game-log.repository';
import { GameQueue } from './game-queue';
import { SimulationService } from './simulation.service';
import { GameSocketSession } from './game-socket-session';

const GameRepositories = [
  {
    provide: GameLogRepository,
    useValue: MockGameLogRepository,
  },
  {
    provide: GameRepository,
    useValue: MockGameRepository,
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
    ...GameRepositories,
  ],
  controllers: [],
  exports: [GameGateway],
})
export class GameModule {}
