import {
  Controller, HttpCode, Param, Post, Put, Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AlarmService } from 'src/alarm/alarm.service';
import { User } from 'src/auth/user.decorator';
import AlarmCode from 'src/enums/mastercode/alarm-code.enum';
import AlarmType from 'src/enums/mastercode/alarm-type.enum';
import { UserDto } from 'src/user/dto/user.dto';
import { GameService } from './game.service';

@Controller('game')
export default class GameController {
// TODO(jinbekim)
  constructor(
    private readonly gameService: GameService,
    private readonly alarmService: AlarmService,
  ) {

  }

  /**
   * 같이 게임할 유저의 시퀀스를 전달 받고, 해당 유저와 클라이언트의 정보로 알람을 생성함
   * 이후, 게임 수락이나 거절에 따라 대응.
   */
  @ApiOperation({ summary: '게임 초대', description: '상대방에게 게임 초대 메시지를 날립니다. 성공시 204 (No content)를 리턴합니다. ' })
  @ApiResponse({ status: 204, description: '초대 성공' })
  @ApiResponse({ status: 400, description: 'player의 seq가 유효하지 않은 경우' })
  @ApiParam({
    name: 'player', type: Number, example: 1, description: '초대할 사용자 Seq',
  })
  @Post('invite/:playerSeq')
  @HttpCode(204)
  async invitePlayer(@User() user: UserDto, @Param('playerSeq') player: number) {
    return this.alarmService.addAlarm(user.userSeq, player, AlarmType.ALTP20, AlarmCode.ALAM21);
  }

  /**
   * 게임 초대를 수락합니다. alarm 정보를 수정하고 방을 생성합니다.
   */
  @Put('accept/:alarmSeq')
  async acceptInvite(@Param('alarmSeq') alarmSeq: number) {
    return this.gameService.handleAcceptInvite(alarmSeq);
  }

  // TODO(jinbekim)
  // TODO(jinbekim)
  // TODO(jinbekim)
  @Put()
  async rejectInvite() {
    return this.alarmService.deleteAlarm();
  }
}
