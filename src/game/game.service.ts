import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { AlarmService } from 'src/alarm/alarm.service';
import { UserRankService } from 'src/profile/user-rank.service';
import {
  GameData, MetaData,
} from './dto/game-data';
import { InGameData, PaddleDirective } from './dto/in-game.dto';
import { SimulationService } from './simulation.service';
import { GameQueue } from './game-queue';
import { RuleDto } from './dto/rule.dto';

@Injectable()
export class GameService {
  private readonly logger: Logger = new Logger('GameService');

  /** game list  */
  private games: Map<string, GameData> = new Map();

  /** To quickly get roomId which is participanted by the userSeq */
  private users: Map<number, string> = new Map();

  constructor(
    private eventRunner: EventEmitter2,
    private gameQueue: GameQueue,
    private simulator: SimulationService,
    private readonly userService: UserService,
    private readonly alarmService: AlarmService,
    private readonly userRankService: UserRankService,
  ) {}

  /** roomId를 통해 현재 이 방이 진행중 인지 확인한다. */
  checkPresenceOf(roomId: string): boolean {
    if (this.games.get(roomId)) return true;
    return false;
  }

  /** userSeq를 통해 현재 진행중인 게임을 찾는다. */
  findCurrentGameByUserSeq(userSeq: number): GameData | undefined {
    const roomId = this.users.get(userSeq);
    return this.games.get(roomId);
  }

  findCurrentGame() {
    return this.simulator.findCurrentGame();
  }

  async handleEnqueue(client: any, ruleData: RuleDto) {
    this.logger.debug(`user client: ${client.request.user.userSeq} and ruleData: ${ruleData}`);
    const matchedPlayers = await this.gameQueue.enQueue(client, ruleData);
    this.logger.debug('enqueue reusult', matchedPlayers);
    /** if not matched return */
    if (matchedPlayers === false) return;
    await this.createGame(matchedPlayers);
  }

  handleDequeue(client: any, ruleData: RuleDto) {
    this.logger.debug('handleDequeue', ruleData);
    return this.gameQueue.deQueue(client, ruleData);
  }

  /**
   * 게임 초대를 수락한다.
   * 수락한 알람 시퀀스를 토대로 연관된 유저 두명을 불러와 게임을 생성한다.
   */
  async handleAcceptInvite(alarmSeq: number) {
    this.logger.debug('handle Invite');
    const alarm = await this.alarmService.getAlarmBySeq(alarmSeq);
    const bluePlayer = await this.userService.findByUserId(alarm.receiverSeq);
    const redPlayer = await this.userService.findByUserId(alarm.senderSeq);
    if (bluePlayer === undefined || redPlayer === undefined) { throw new NotFoundException('해당 유저가 존재하지 않습니다.'); }
    // TODO: check if sender is not in game state.
    // const sender = await this.alarmService.getOnlineClients(alarm.senderSeq);
    // if (Array.isArray(sender) && sender.length === 0)
    //  throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    await this.createGame([[bluePlayer, null], [redPlayer, null]]);
  }

  /**
   * 일반적인 큐 시스템을 이용해서 매칭 되었을 경우에 매치 후 방을 생성한다.
   */
  async createGame(matchedPlayers: [any, RuleDto][]) {
    this.logger.debug('createGame(matchedPlayers): creating');

    /** after Matching players */
    const [[bluePlayer, blueRule], [redPlayer, redRule]] = [...matchedPlayers];
    const newGame = new GameData();
    const newRoomId = randomUUID();

    /** save in session, 저장 잘 안되면 인자로 userdto말고 세션 통째로 가져와야함.
     * session에 roomid 저장
    */
    let blue:UserDto; let
      red:UserDto;
    if (bluePlayer.request) {
      bluePlayer.request.session.passport.user.roomId = newRoomId;
      bluePlayer.request.user.roomId = newRoomId;
      redPlayer.request.session.passport.user.roomId = newRoomId;
      redPlayer.request.user.roomId = newRoomId;
      blue = bluePlayer.request.user;
      red = redPlayer.request.user;
      await bluePlayer.request.session.save();
      await redPlayer.request.session.save();
    } else {
      blue = bluePlayer;
      red = redPlayer;
    }

    /** temporarily apply bluePlayer's rule */
    newGame.ruleData = new RuleDto();
    if (blueRule && redRule) {
      newGame.ruleData.ballSpeed = blueRule.ballSpeed;
      newGame.ruleData.matchScore = blueRule.matchScore;
      newGame.ruleData.paddleSize = redRule.paddleSize;
      newGame.ruleData.isRankGame = redRule.isRankGame;
    }

    /** metaData */
    newGame.metaData = new MetaData(
      newRoomId,
      blue,
      red,
      newGame.ruleData.isRankGame,
    );

    /** inGameData */
    newGame.inGameData = new InGameData();
    this.games.set(newGame.metaData.roomId, newGame);
    this.users.set(blue.userSeq, newRoomId);
    this.users.set(red.userSeq, newRoomId);

    /** add gameData into simulator */
    await this.simulator.initBeforeStartGame(newGame);
    this.eventRunner.emit('game:ready', newGame);
  }

  /** 게임을 종료 시킨다. */
  async endGame(roomId: string) {
    this.logger.debug(`ended games roomId: ${roomId}`);
    console.log('games', this.games);
    const {
      metaData: { playerBlue, playerRed, isRankGame },
      inGameData: { winnerSeq },
    } = this.games.get(roomId);
    this.games.delete(roomId);
    this.users.delete(playerRed.userSeq);
    this.users.delete(playerBlue.userSeq);
    if (isRankGame) {
      if (winnerSeq && winnerSeq === playerBlue.userSeq) {
        this.logger.debug(playerRed.userSeq, 'red is win and record rank');
        await this.userRankService.saveLoseUser(playerRed.userSeq);
        await this.userRankService.saveWinUser(playerBlue.userSeq);
      } else if (winnerSeq && winnerSeq === playerRed.userSeq) {
        this.logger.debug(playerBlue.userSeq, ' blue is win and record rank');
        await this.userRankService.saveLoseUser(playerBlue.userSeq);
        await this.userRankService.saveWinUser(playerRed.userSeq);
      } else {
        this.logger.error('end game is going something wrong');
      }
    }
    await this.simulator.saveAfterEndGame(roomId);
  }

  /**
   * 자신의 패들 방향을 바꾼다.
   * @param roomId 방 아이디
   * @param userId 유저 아이디
   * @param cmd 패들 움직임 명령
   */
  handlePaddle(roomId: string, userId: number, cmd: PaddleDirective) {
    this.logger.debug(`handlePaddle called with roomId ${roomId} userId ${userId}, ${cmd}`);
    this.simulator.handlePaddle(roomId, userId, cmd);
  }
}
