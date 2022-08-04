import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { UserModule } from 'src/user/user.module.e2e-spec';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameLogRepository } from './repository/game-log.repository';
import { GameQueue } from './game-queue';
import { SimulationService } from './simulation.service';
import { GameLogController } from './game-log.controller';
import { GameLogService } from './game-log.service';
import { MockGameLogRepository } from './repository/mock/mock.game-log.repository';
import GameController from './game.controller';

@Module({
  imports: [
    forwardRef(() => AppModule),
    EventEmitterModule.forRoot(),
    // TypeOrmModule.forFeature([GameLogRepository]),
    UserModule,
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
    GameLogService,
  ],
  controllers: [GameLogController, GameController],
  exports: [GameGateway, GameLogService],
})
export class GameModule {}
