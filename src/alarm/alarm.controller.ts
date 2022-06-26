import {
  Controller, Put, Get, Logger, Param, ValidationPipe, Delete, HttpCode, UsePipes,
} from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/auth/user.decorator';
import { UserDto } from 'src/user/dto/user.dto';
import { AlarmService } from './alarm.service';
import { AlarmResponseDto } from './dto/alarm-response.dto';

@ApiTags('알람')
@Controller('alarm')
@UsePipes(new ValidationPipe({ transform: true }))
export class AlarmController {
  private logger: Logger = new Logger(AlarmController.name);

  constructor(
    private alarmService: AlarmService,
  ) { }

  @ApiOperation({
    summary: '알람 가져오기',
    description: '알람을 가져옵니다. 읽음 처리 한 알람은 가져오지 않습니다.',
  })
  @ApiResponse({ status: 200, type: [AlarmResponseDto], description: '알람을 가져옴' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @Get('alarms')
  async getAlarms(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getAlarms');
    return this.alarmService.getAlarms(user.userSeq);
  }

  @ApiOperation({
    summary: '알람 모두 가져오기',
    description: '알람을 가져옵니다. 읽음 처리 한 알람을 포함합니다.',
  })
  @ApiResponse({ status: 200, type: [AlarmResponseDto], description: '알람을 가져옴' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @Get('alarms/all')
  async getAllAlarms(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getAlarms');
    return this.alarmService.getAllAlarms(user.userSeq);
  }

  @ApiOperation({
    summary: '알람 읽음처리',
    description: '알람을 읽음 처리합니다.',
  })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiParam({
    name: 'id', type: Number, example: 1, description: '알람 ID',
  })
  @Put(':id')
  @HttpCode(204)
  async readAlarm(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
      @Param('id') id: number,
  ): Promise<void> {
    this.logger.debug('readAlarm');
    await this.alarmService.readAlarm(id, user.userSeq);
  }

  @ApiOperation({
    summary: '알람 삭제',
    description: '알람을 삭제합니다.',
  })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @ApiParam({
    name: 'id', type: Number, example: 1, description: '알람 ID',
  })
  @Delete(':id')
  @HttpCode(204)
  async deleteAlarm(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
      @Param('id') id: number,
  ): Promise<void> {
    this.logger.debug('deleteAlarm');
    await this.alarmService.deleteAlarm(id, user.userSeq);
  }
}
