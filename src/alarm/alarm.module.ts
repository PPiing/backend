import { Module, CacheModule, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { AlarmController } from './alarm.controller';
import { AlarmGateway } from './alarm.gateway';
import { AlarmService } from './alarm.service';
import AlarmRepository from './repository/alarm.repository';

@Module({
  imports: [
    forwardRef(() => AppModule),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({ ttl: 0 }),
    TypeOrmModule.forFeature([
      AlarmRepository,
    ]),
  ],
  controllers: [
    AlarmController,
  ],
  providers: [
    AlarmGateway,
    AlarmService,
  ],
  exports: [
    AlarmService,
  ],
})
export class AlarmModule { }
