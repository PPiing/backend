import { CacheModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlarmService } from './alarm.service';
import AlarmRepository from './repository/alarm.repository';
import MockAlarmRepository from './repository/mock/mock.alarm.repository';

const repositories = [
  {
    provide: getRepositoryToken(AlarmRepository),
    useClass: MockAlarmRepository,
  },
];

describe('AlarmService 테스트', () => {
  let alarmService: AlarmService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({ ttl: 0 }),
        EventEmitterModule.forRoot(),
      ],
      providers: [
        AlarmService,
        ...repositories,
      ],
    }).compile();

    alarmService = app.get<AlarmService>(AlarmService);
  });

  describe('getConfirms', () => {
    test('getConfirms 테스트', async () => {
      // given
      const userSeq = 1;

      // when
      const alarms = await alarmService.getConfirms(userSeq);

      // then
      expect(alarms.length).toBe(1);
      alarms.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });
  });

  describe('getAllConfirms', () => {
    test('getAllConfirms 테스트', async () => {
      // given
      const userSeq = 1;

      // when
      const alarms = await alarmService.getAllConfirms(userSeq);

      // then
      expect(alarms.length).toBe(1);
      alarms.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });
  });

  describe('getAlerts', () => {
    test('getAlerts 테스트', async () => {
      // given
      const userSeq = 1;

      // when
      const alarms = await alarmService.getAlerts(userSeq);

      // then
      expect(alarms.length).toBe(1);
      alarms.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });
  });

  describe('getAllAlerts', () => {
    test('getAllAlerts 테스트', async () => {
      // given
      const userSeq = 1;

      // when
      const alarms = await alarmService.getAllAlerts(userSeq);

      // then
      expect(alarms.length).toBe(1);
      alarms.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });
  });

  describe('readAlarm', () => {
    test('readAlarm 테스트', async () => {
      // given
      const alarmSeq = 3;
      const who = 1;

      // when
      await alarmService.readAlarm(alarmSeq, who);
      const alarms = await alarmService.getAlerts(1);
      const alarmsAll = await alarmService.getAllAlerts(1);

      // then
      expect(alarms.length).toBe(1);
      expect(alarmsAll.length).toBe(1);
    });
  });

  describe('deleteAlarm', () => {
    test('deleteAlarm 테스트', async () => {
      // given
      const alarmSeq = 3;
      const who = 1;

      // when
      await alarmService.deleteAlarm(alarmSeq, who);
      const alarms = await alarmService.getAlerts(1);
      const alarmsAll = await alarmService.getAllAlerts(1);

      // then
      expect(alarms.length).toBe(1);
      expect(alarmsAll.length).toBe(1);
    });
  });
});
