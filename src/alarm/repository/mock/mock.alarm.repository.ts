import { AlarmResponseDto } from 'src/alarm/dto/alarm-response.dto';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';

export default class MockAlarmRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      alarmSeq: 1,
      alarmType: AlarmType.ALTP10,
      alarmCode: AlarmCode.ALAM11,
      read: false,
      delete: false,
      createdAt: new Date(),
      receiverSeq: 2,
      senderSeq: 1,
    });
    this.MockEntity.push({
      alarmSeq: 2,
      alarmType: AlarmType.ALTP10,
      alarmCode: AlarmCode.ALAM12,
      read: false,
      delete: false,
      createdAt: new Date(),
      receiverSeq: 1,
      senderSeq: 0,
    });
    this.MockEntity.push({
      alarmSeq: 3,
      alarmType: AlarmType.ALTP20,
      alarmCode: AlarmCode.ALAM21,
      read: false,
      delete: false,
      createdAt: new Date(),
      receiverSeq: 1,
      senderSeq: 0,
    });
  }

  async createAlarm(
    senderSeq: number,
    receiverSeq: number,
    alarmType: AlarmType,
    alarmCode: AlarmCode,
  ) : Promise<void> {
    this.MockEntity.push({
      alarmSeq: this.MockEntity.length + 1,
      alarmType,
      alarmCode,
      read: false,
      delete: false,
      createdAt: new Date(),
      receiverSeq,
      senderSeq,
    });
  }

  async getAlarms(userSeq: number, alarmType: AlarmType): Promise<AlarmResponseDto[]> {
    return this.MockEntity
      .filter((e) => e.receiverSeq === userSeq
    && e.alarmType === alarmType
    && e.read === false
    && e.delete === false)
      .map((alarm) => ({
        alarmSeq: alarm.alarmSeq,
        from: alarm.senderSeq,
        type: alarm.alarmType,
        code: alarm.alarmCode,
      }));
  }

  async getAllAlarms(userSeq: number, alarmType: AlarmType): Promise<AlarmResponseDto[]> {
    return this.MockEntity
      .filter((e) => e.receiverSeq === userSeq
      && e.delete === false
      && e.alarmType === alarmType)
      .map((alarm) => ({
        alarmSeq: alarm.alarmSeq,
        from: alarm.senderSeq,
        type: alarm.alarmType,
        code: alarm.alarmCode,
      }));
  }

  async readAlarm(alarmSeq: number, who: number): Promise<boolean> {
    const target = this.MockEntity.find((e) => e.alarmSeq === alarmSeq);
    if (target === undefined || target.receiverSeq !== who) {
      return false;
    }
    target.read = true;
    return true;
  }

  async deleteAlarm(alarmSeq: number, who: number): Promise<boolean> {
    const target = this.MockEntity.find((e) => e.alarmSeq === alarmSeq);
    if (target === undefined || target.receiverSeq !== who) {
      return false;
    }
    if (target) {
      target.read = true;
      target.delete = true;
    }
    return true;
  }
}
