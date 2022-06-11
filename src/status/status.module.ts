import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { StatusGateway } from './status.gateway';

@Module({
  controllers: [StatusController],
  providers: [StatusService, StatusGateway]
})
export class StatusModule {}
