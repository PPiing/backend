import GameLog from 'src/entities/game-log.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(GameLog)
export class GameLogRepository extends Repository<GameLog> {}
