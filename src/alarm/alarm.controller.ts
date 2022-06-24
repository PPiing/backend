import { Controller, Logger } from '@nestjs/common';

@Controller('alarm')
export class AlarmController {
  private logger: Logger = new Logger(AlarmController.name);

  constructor() { }
}
