import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SchedulerRegistry } from '@nestjs/schedule';
import AppModule from '../src/app.module.e2e-spec';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => request(app.getHttpServer())
    .get('/')
    .expect(200)
    .expect('Hello World!'));

  afterEach(async () => {
    // 스케쥴러가 남아있으면 테스트가 비정상적으로 종료되므로 남아있는 스케쥴러를 모두 제거한다.
    const schedulerRegistry: SchedulerRegistry = app.get<SchedulerRegistry>(SchedulerRegistry);
    const cronJobs = schedulerRegistry.getCronJobs();
    const timeouts = schedulerRegistry.getTimeouts();
    const intervals = schedulerRegistry.getIntervals();
    cronJobs.forEach((_, name) => {
      schedulerRegistry.deleteCronJob(name);
    });
    timeouts.forEach((name) => {
      schedulerRegistry.deleteTimeout(name);
    });
    intervals.forEach((name) => {
      schedulerRegistry.deleteInterval(name);
    });
    await app.close();
  });
});
