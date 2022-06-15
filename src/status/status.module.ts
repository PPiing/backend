import { CacheModule, Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusGateway } from './status.gateway';
import StatusRepository from './status.repository';

@Module({
  imports: [
    CacheModule.register({ ttl: 0 }),
  ],
  providers: [
    StatusGateway,
    StatusService,
    StatusRepository,
  ],
})
export class StatusModule { }
