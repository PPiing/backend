import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameLogRepository, MockGameLogRepository } from './game-log.repository';
import { GameQueue } from './game-queue';
import { SimulationService } from './simulation.service';
import { GameSocketSession } from './game-socket-session';
import { GameLogController } from './game-log.controller';
import { GameLogService } from './game-log.service';
import { SessionMiddleware } from 'src/session-middleware';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // TypeOrmModule.forFeature([GameRepository, GameLogRepository]),
  ],
  providers: [
    GameService,
    GameGateway,
    GameQueue,
    {
      provide: getRepositoryToken(GameLogRepository),
      useClass: MockGameLogRepository,
    },
    SimulationService,
    GameSocketSession,
    GameLogService,
    SessionMiddleware,
  ],
  controllers: [GameLogController],
  exports: [GameGateway],
})
export class GameModule {}
