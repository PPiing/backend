import {
  CACHE_MANAGER, Inject, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';
import { Socket } from 'socket.io';
import Alarm from 'src/entities/alarm.entity';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';
import { AlarmResponseDto } from './dto/alarm-response.dto';
import AlarmRepository from './repository/alarm.repository';

@Injectable()
export class AlarmService {
  constructor(
    private alarmRepository: AlarmRepository,
    private eventRunner: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  /**
   * 사용자가 접속하면 소켓 ID를 온라인 사용자 리스트에 추가합니다.
   *
   * @param user 접속한 사용자 소켓
   * @param userID 접속한 사용자 식별자
   */
  async onlineUserAdd(user: Socket, userID: number): Promise<void> {
    const key = `AlarmService-userID-${userID}`;
    const value: undefined | Array<string> = await this.cacheManager.get(key);
    if (value === undefined) {
      await this.cacheManager.set(key, [user.id]);
    } else {
      await this.cacheManager.set(key, [...value, user.id]);
    }
  }

  /**
   * 사용자 연결이 해제되면 온라인 사용자 리스트에서 제거합니다.
   *
   * @param userID 접속한 사용자 식별자
   */
  async onlineUserRemove(user: Socket, userID: number): Promise<void> {
    const key = `AlarmService-userID-${userID}`;
    const value: undefined | Array<string> = await this.cacheManager.get(key);
    if (value) {
      const newValue = value.filter((v) => v !== user.id);
      if (newValue.length > 0) {
        await this.cacheManager.set(key, newValue);
      } else {
        await this.cacheManager.del(key);
      }
    }
  }

  /**
   * 실사용자의 ID를 이용해 소켓 ID 배열을 가져옵니다.
   *
   * @param userID 접속한 사용자 식별자
   * @returns 클라이언트 소켓 ID 배열
   */
  async getOnlineClients(userID: number): Promise<Array<string>> {
    const key = `AlarmService-userID-${userID}`;
    const value: undefined | Array<string> = await this.cacheManager.get(key);
    if (value === undefined) {
      return [];
    }
    return value;
  }

  /**
   * 컨펌을 받아야 하는 알람의 경우, 해당 알람이 유효한지 확인합니다.
   * 예를 들면 A가 B에게 친구 추가를 할 경우 실제 관계를 맺기 전 해당 함수를 호출해서 유효성을 판단해야 합니다.
   *
   * @param senderSeq 알람을 보내는 유저 ID
   * @param receiverSeq 알람을 받는 유저 ID
   * @param alarmCode 알람 코드
   */
  async confirmedAlarmCheck(
    senderSeq: number,
    receiverSeq: number,
    alarmCode: AlarmCode,
  ) : Promise<boolean> {
    return this.alarmRepository.unresolvedAlarmCheck(senderSeq, receiverSeq, alarmCode);
  }

  /**
   * 알람을 새로 추가합니다.
   *
   * @param senderSeq 알람을 보내는 유저 ID
   * @param receiverSeq 알람을 받는 유저 ID
   * @param alarmType 알람 타입
   * @param alarmCode 알람 코드
   */
  async addAlarm(
    senderSeq: number,
    receiverSeq: number,
    alarmType: AlarmType,
    alarmCode: AlarmCode,
  ) : Promise<void> {
    const presence = await this.alarmRepository.findOne({
      where: {
        senderSeq,
        receiverSeq,
        alarmType,
        alarmCode,
        read: false,
      },
    });
    // TODO: check online status of receiver & sender
    if (!presence) {
      await this.alarmRepository.createAlarm(senderSeq, receiverSeq, alarmType, alarmCode);
    }
    this.eventRunner.emit('alarm:refresh', receiverSeq);
  }

  async findAlarm(
    senderSeq: number,
    receiverSeq: number,
    alarmType: AlarmType,
    alarmCode: AlarmCode,
  ): Promise<number> {
    const presence = await this.alarmRepository.findOne({
      where: {
        senderSeq,
        receiverSeq,
        alarmType,
        alarmCode,
        read: false,
        delete: false,
      },
    });
    return presence.alarmSeq;
  }

  /**
   * 특정 유저가 수신한 일반 알람을 가져옵니다. 읽음 처리 된 알람은 가져오지 않습니다.
   *
   * @param userSeq 유저 ID
   * @returns 알람 응답 DTO 배열
   */
  async getAlerts(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAlarms(userSeq, AlarmType.ALTP10);
  }

  /**
   * 특정 유저가 수신한 컨펌 알람을 가져옵니다. 읽음 처리 된 알람은 가져오지 않습니다.
   *
   * @param userSeq 유저 ID
   * @returns 알람 응답 DTO 배열
   */
  async getConfirms(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAlarms(userSeq, AlarmType.ALTP20);
  }

  /**
   * 특정 유저가 수신한 일반 알람을 가져옵니다. 읽은 알람도 가져옵니다.
   *
   * @param userSeq 유저 ID
   * @returns 알람 응답 DTO 배열
   */
  async getAllAlerts(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAlarms(userSeq, AlarmType.ALTP10);
  }

  /**
   * 특정 유저가 수신한 컨펌 알람을 가져옵니다. 읽은 알람도 가져옵니다.
   *
   * @param userSeq 유저 ID
   * @returns 알람 응답 DTO 배열
   */
  async getAllConfirms(userSeq: number): Promise<AlarmResponseDto[]> {
    return this.alarmRepository.getAlarms(userSeq, AlarmType.ALTP20);
  }

  /**
   * 알람을 가져옵니다.
   *
   * @param alarmSeq 알람 ID
   */
  async getAlarmBySeq(alarmSeq: number): Promise<Alarm> {
    const result = await this.alarmRepository.findOne(alarmSeq);
    if (!result) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    return result;
  }

  /**
   * 알람을 읽음 처리합니다.
   *
   * @param alarmSeq 알람 ID
   * @param who 읽은 사람.
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
   * @param who 삭제 요청한 사람, userSeq
   */
  async deleteAlarm(alarmSeq: number, who: number): Promise<void> {
    const result = await this.alarmRepository.deleteAlarm(alarmSeq, who);
    if (!result) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    // for refreshing alarm.
    this.eventRunner.emit('alarm:refresh', who);
  }
}
