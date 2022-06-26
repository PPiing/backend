import { Module, CacheModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlarmController } from './alarm.controller';
import { AlarmGateway } from './alarm.gateway';
import { AlarmService } from './alarm.service';
import AlarmRepository from './repository/alarm.repository';
import MockAlarmRepository from './repository/mock/mock.alarm.repository';

const repositories = [
  {
    provide: getRepositoryToken(AlarmRepository),
    useClass: MockAlarmRepository,
  },
];

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({ ttl: 0 }),
  ],
  controllers: [
    AlarmController,
  ],
  providers: [
    AlarmGateway,
    AlarmService,
    ...repositories,
  ],
})
export class AlarmModule { }
