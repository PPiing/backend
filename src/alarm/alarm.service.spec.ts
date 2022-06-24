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

  describe.skip('service test', () => {
    test('service test', () => {});
  });

});
