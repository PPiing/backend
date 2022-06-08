import { Game } from 'src/entities/game.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {}
