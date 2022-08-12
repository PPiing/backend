import Alarm from 'src/entities/alarm.entity';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';
import { EntityRepository, Repository } from 'typeorm';
import { AlarmResponseDto } from '../dto/alarm-response.dto';

@EntityRepository(Alarm)
export default class AlarmRepository extends Repository<Alarm> {
  /**
   * 알람을 DB에 기록합니다.
   *
   * @param senderSeq
   * @param receiverSeq
   * @param alarmType
   * @param alarmCode
   */
  async createAlarm(
    senderSeq: number,
    receiverSeq: number,
    alarmType: AlarmType,
    alarmCode: AlarmCode,
  ) : Promise<void> {
    const alarm = new Alarm();
    alarm.senderSeq = senderSeq;
    alarm.receiverSeq = receiverSeq;
    alarm.alarmType = alarmType;
    alarm.alarmCode = alarmCode;
    await this.save(alarm);
  }

  /**
   * 컨펌 알람 중 송신자, 수신자, 알람 코드를 이용하여 해당 알람이 처리되었는지 확인합니다.
   * 처리 여부는 읽기 여부를 이용하여 체크합니다.
   *
   */
  async unresolvedAlarmCheck(
    senderSeq: number,
    receiverSeq: number,
    alarmCode: AlarmCode,
  ) : Promise<boolean> {
    const rtn = await this.find({
      senderSeq,
      receiverSeq,
      delete: false,
      read: false,
      alarmCode,
    });
    return rtn.length > 0;
  }

  /**
   * 특정 유저가 수신한 읽지 않은 알람을 가져옵니다.
   *
   * @param userSeq
   * @returns
   */
  async getAlarms(userSeq: number, alarmType: AlarmType): Promise<AlarmResponseDto[]> {
    if (!userSeq) {
      return [];
    }
    const rtn = await this.find({
      receiverSeq: userSeq,
      read: false,
      delete: false,
      alarmType,
    });
    return rtn.map((alarm) => ({
      alarmSeq: alarm.alarmSeq,
      from: alarm.senderSeq,
      type: alarm.alarmType,
      code: alarm.alarmCode,
    }));
  }

  /**
   * 특정 유저가 수신한 알람을 모두 가져옵니다.
   *
   * @param userSeq
   * @returns
   */
  async getAllAlarms(userSeq: number, alarmType: AlarmType): Promise<AlarmResponseDto[]> {
    if (!userSeq) {
      return [];
    }
    const rtn = await this.find({
      receiverSeq: userSeq,
      delete: false,
      alarmType,
    });
    return rtn.map((alarm) => ({
      alarmSeq: alarm.alarmSeq,
      from: alarm.senderSeq,
      type: alarm.alarmType,
      code: alarm.alarmCode,
    }));
  }

  /**
   * 특정 알람을 읽음 처리 합니다.
   *
   * @param alarmSeq
   * @param who 읽은사람.
   * @returns
   */
  async readAlarm(alarmSeq: number, who: number): Promise<boolean> {
    const alarm = await this.findOne(alarmSeq);
    if (alarm === undefined || alarm.receiverSeq !== who) {
      return false;
    }
    alarm.read = true;
    await this.save(alarm);
    return true;
  }

  /**
   * 특정 알람을 삭제 처리 합니다.
   *
   * @param alarmSeq
   * @param who
   * @returns
   */
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
