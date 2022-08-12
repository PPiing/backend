import {
  Controller, Put, Get, Logger, Param, ValidationPipe, Delete, HttpCode, UsePipes, UseGuards,
} from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/auth/user.decorator';
import { CheckLogin } from 'src/guards/check-login.guard';
import { UserDto } from 'src/user/dto/user.dto';
import { AlarmService } from './alarm.service';
import { AlarmResponseDto } from './dto/alarm-response.dto';

@ApiTags('알람')
@Controller('alarm')
@UseGuards(CheckLogin)
@UsePipes(new ValidationPipe({ transform: true }))
export class AlarmController {
  private logger: Logger = new Logger(AlarmController.name);

  constructor(
    private alarmService: AlarmService,
  ) { }

  @ApiOperation({
    summary: '일반 알람 가져오기',
    description: '일반 알람을 가져옵니다. 읽음 처리 한 알람은 가져오지 않습니다.',
  })
  @ApiResponse({ status: 200, type: [AlarmResponseDto], description: '알람을 가져옴' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @Get('alerts')
  async getAlerts(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getAlerts');
    return this.alarmService.getAlerts(user.userSeq);
  }

  @ApiOperation({
    summary: '컨펌 알람 가져오기',
    description: '컨펌 알람을 가져옵니다. 읽음 처리 한 알람은 가져오지 않습니다.',
  })
  @ApiResponse({ status: 200, type: [AlarmResponseDto], description: '알람을 가져옴' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @Get('confirms')
  async getConfirms(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getConfirms');
    return this.alarmService.getConfirms(user.userSeq);
  }

  @ApiOperation({
    summary: '일반 알람 모두 가져오기',
    description: '일반 알람을 가져옵니다. 읽음 처리 한 알람을 포함합니다.',
  })
  @ApiResponse({ status: 200, type: [AlarmResponseDto], description: '알람을 가져옴' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @Get('alerts/all')
  async getAllAlerts(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getAlerts');
    return this.alarmService.getAllAlerts(user.userSeq);
  }

  @ApiOperation({
    summary: '컨펌 알람 모두 가져오기',
    description: '컨펌 알람을 가져옵니다. 읽음 처리 한 알람을 포함합니다.',
  })
  @ApiResponse({ status: 200, type: [AlarmResponseDto], description: '알람을 가져옴' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @Get('confirms/all')
  async getAllConfirms(
    @User(new ValidationPipe({ validateCustomDecorators: true })) user: UserDto,
  ): Promise<AlarmResponseDto[]> {
    this.logger.debug('getConfirms');
    return this.alarmService.getAllConfirms(user.userSeq);
  }

  /**
   *
   * @param user 읽은사람.
   * @param id 알람시퀀스
   */
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
