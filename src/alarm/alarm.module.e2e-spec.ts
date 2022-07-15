import { Module, CacheModule, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { getRepositoryToken } from '@nestjs/typeorm';
import AppModule from 'src/app.module.e2e-spec';
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
    forwardRef(() => AppModule),
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
  exports: [
    AlarmService,
  ],
})
export class AlarmModule { }
