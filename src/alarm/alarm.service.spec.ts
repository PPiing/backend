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
      providers: [
        AlarmService,
        ...repositories,
      ],
    }).compile();

    alarmService = app.get<AlarmService>(AlarmService);
  });

  describe('getAlarms', () => {
    test('getAlarms 테스트', async () => {
      // given
      const userSeq = 1;

      // when
      const alarms = await alarmService.getAlarms(userSeq);

      // then
      expect(alarms.length).toBe(2);
      alarms.forEach((alarm) => {
        expect(alarm).toHaveProperty('from');
        expect(alarm).toHaveProperty('type');
        expect(alarm).toHaveProperty('code');
      });
    });
  });

  describe('getAllAlarms', () => {
    test('getAllAlarms 테스트', async () => {
      // given
      const userSeq = 1;

      // when
      const alarms = await alarmService.getAlarms(userSeq);

      // then
      expect(alarms.length).toBe(2);
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
      const alarms = await alarmService.getAlarms(1);
      const alarmsAll = await alarmService.getAllAlarms(1);

      // then
      expect(alarms.length).toBe(1);
      expect(alarmsAll.length).toBe(2);
    });
  });

  describe('deleteAlarm', () => {
    test('deleteAlarm 테스트', async () => {
      // given
      const alarmSeq = 3;
      const who = 1;

      // when
      await alarmService.deleteAlarm(alarmSeq, who);
      const alarms = await alarmService.getAlarms(1);
      const alarmsAll = await alarmService.getAllAlarms(1);

      // then
      expect(alarms.length).toBe(1);
      expect(alarmsAll.length).toBe(1);
    });
  });

});
