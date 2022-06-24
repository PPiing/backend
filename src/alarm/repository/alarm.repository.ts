import Alarm from 'src/entities/alarm.entity';
import { EntityRepository, Repository } from 'typeorm';
import { AlarmResponseDto } from '../dto/alarm-response.dto';

@EntityRepository(Alarm)
export default class AlarmRepository extends Repository<Alarm> {
  async getAlarms(userSeq: number): Promise<AlarmResponseDto[]> {
    if (!userSeq) {
      return [];
    }
    const rtn = await this.find({
      receiverSeq: userSeq,
      read: false,
    });
    return rtn.map((alarm) => ({
      alarmSeq: alarm.alarmSeq,
      from: alarm.senderSeq,
      type: alarm.alarmType,
      code: alarm.alarmCode,
    }));
  }

  async getAllAlarms(userSeq: number): Promise<AlarmResponseDto[]> {
    if (!userSeq) {
      return [];
    }
    const rtn = await this.find({ receiverSeq: userSeq });
    return rtn.map((alarm) => ({
      alarmSeq: alarm.alarmSeq,
      from: alarm.senderSeq,
      type: alarm.alarmType,
      code: alarm.alarmCode,
    }));
  }

  async readAlarm(alarmSeq: number, who: number): Promise<boolean> {
    const alarm = await this.findOne(alarmSeq);
    if (alarm === undefined || alarm.receiverSeq !== who) {
      return false;
    }
    alarm.read = true;
    await this.save(alarm);
    return true;
  }

  async deleteAlarm(alarmSeq: number, who: number): Promise<boolean> {
    const alarm = await this.findOne(alarmSeq);
    if (alarm === undefined || alarm.receiverSeq !== who) {
      return false;
    }
    alarm.read = true;
    alarm.delete = true;
    await this.save(alarm);
    return true;
  }
}
