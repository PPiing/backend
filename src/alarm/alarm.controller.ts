import { Controller, Get, Logger, ValidationPipe } from '@nestjs/common';
import { User } from 'src/auth/user.decorator';
import { UserDto } from 'src/user/dto/user.dto';
import { AlarmService } from './alarm.service';
import { AlarmResponseDto } from './dto/alarm-response.dto';

@Controller('alarm')
export class AlarmController {
  private logger: Logger = new Logger(AlarmController.name);

  constructor(
    private alarmService: AlarmService,
  ) { }

  @Get('alarms')
  async getAlarms(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getAlarms');
    return this.alarmService.getAlarms(user.userSeq);
  }

  @Get('alarms/all')
  async getAllAlarms(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getAlarms');
    return this.alarmService.getAllAlarms(user.userSeq);
  }
}
