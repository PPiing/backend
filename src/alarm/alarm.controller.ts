import { Controller, Put, Get, Logger, Param, ValidationPipe, Delete, HttpCode } from '@nestjs/common';
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

  //TODO: Swagger 명세 추가해야 함.

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

  @Put(':id')
  @HttpCode(204)
  async readAlarm(
    @Param('id') id: number,
  ): Promise<void> {
    await this.alarmService.readAlarm(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteAlarm(
    @Param('id') id: number,
  ): Promise<void> {
    await this.alarmService.deleteAlarm(id);
  }
}
