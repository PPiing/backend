import Alarm from 'src/entities/alarm.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Alarm)
export default class AlarmRepository extends Repository<Alarm> {
}
