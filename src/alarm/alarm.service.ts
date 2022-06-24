import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AlarmResponseDto } from './dto/alarm-response.dto';
import AlarmRepository from './repository/alarm.repository';

@Injectable()
export class AlarmService {
  constructor(
    private alarmRepository: AlarmRepository,
  ) { }

  /**
   * 특정 유저가 수신한 알람을 가져옵니다. 읽음 처리 된 알람은 가져오지 않습니다.
   * 
   * @param userSeq 유저 ID
   * @returns 알람 응답 DTO 배열
   */
  async getAlarms(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAlarms(userSeq);
  }

  /**
   * 특정 유저가 수신한 알람을 가져옵니다. 읽은 알람도 가져옵니다.
   * 
   * @param userSeq 유저 ID
   * @returns 알람 응답 DTO 배열
   */
  async getAllAlarms(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAllAlarms(userSeq);
  }

  /**
   * 알람을 읽음 처리합니다.
   * 
   * @param alarmSeq 알람 ID
   */
  async readAlarm(alarmSeq: number, who: number): Promise<void> {
    const result = await this.alarmRepository.readAlarm(alarmSeq, who);
    if (!result) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
  }

  /**
   * 알람을 삭제 처리합니다.
   * 
   * @param alarmSeq 알람 ID
   */
  async deleteAlarm(alarmSeq: number, who: number): Promise<void> {
    const result = await this.alarmRepository.deleteAlarm(alarmSeq, who);
    if (!result) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
  }
}
