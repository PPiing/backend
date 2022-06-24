import { Injectable } from '@nestjs/common';
import { AlarmResponseDto } from './dto/alarm-response.dto';
import AlarmRepository from './repository/alarm.repository';

@Injectable()
export class AlarmService {
  constructor(
    private alarmRepository: AlarmRepository,
  ) { }

  async getAlarms(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAlarms(userSeq);
  }

  async getAllAlarms(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAllAlarms(userSeq);
  }
}
