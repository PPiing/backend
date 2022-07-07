import { Logger } from '@nestjs/common';
import GameLog from 'src/entities/game-log.entity';
import GameOption from 'src/enums/mastercode/game-option.enum';
import GameType from 'src/enums/mastercode/game-type.enum';
import { GameLogDto } from 'src/game-log/dto/game-log.dto';
import { GameRecordDto } from 'src/game-log/dto/game-record.dts';

export class MockGameLogRepository {
  private readonly logger: Logger = new Logger(MockGameLogRepository.name);

  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      gameLogSeq: 1,
      gameType: GameType.NORMAL,
      roomId: '1',
      topUserName: 'user1',
      btmUserName: 'user2',
      topUserSeq: 1,
      btmUserSeq: 2,
      winnerSeq: 1,
      topSideScore: 5,
      btmSideScore: 2,
      option1: GameOption.GLOP10,
      option2: GameOption.GLOP20,
      option3: GameOption.GLOP40,
      createdAt: '2022-06-16T00:26:58.205Z',
      updatedAt: '2022-06-16T00:26:58.205Z',
    });
    this.MockEntity.push({
      gameLogSeq: 2,
      roomId: '2',
      topUserName: 'user2',
      btmUserName: 'user3',
      topUserSeq: 2,
      btmUserSeq: 3,
      gameType: GameType.NORMAL,
      winnerSeq: 2,
      topSideScore: 3,
      btmSideScore: 5,
      option1: GameOption.GLOP10,
      option2: GameOption.GLOP20,
      option3: GameOption.GLOP40,
      createdAt: '2022-06-16T00:26:58.205Z',
      updatedAt: '2022-06-16T00:26:58.205Z',
    });
    this.MockEntity.push({
      gameLogSeq: 3,
      roomId: '3',
      topUserName: 'user3',
      btmUserName: 'user4',
      topUserSeq: 3,
      btmUserSeq: 4,
      gameType: GameType.NORMAL,
      winnerSeq: 4,
      topSideScore: 1,
      btmSideScore: 5,
      option1: GameOption.GLOP10,
      option2: GameOption.GLOP20,
      option3: GameOption.GLOP40,
      createdAt: '2022-06-16T00:26:58.205Z',
      updatedAt: '2022-06-16T00:26:58.205Z',
    });
  }

  /**
   * game-log seq로 검색하기
   *
   * @param seq game-log seq
   * @return 찾은 정보
   */
  async findOne(seq: number): Promise<GameLogDto | undefined> {
    this.logger.debug('findOne seq: ', seq);
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of Object.entries(this.MockEntity)) {
      if (val.gameLogSeq === seq) {
        return this.MockEntity[key];
      }
    }
    return undefined;
  }

  /**
   * 새로운 게임 data 생성
   *
   * @param data 새로운 게임 데이터
   * @return 추가된 데이터
   */
  async save(data: GameLogDto): Promise<GameLogDto> {
    await this.MockEntity.push(data);
    return data;
  }

  /**
   * 최근 limit 개의 게임 목록
   * limit < 0 : 모든 게임 목록을 가져온다.
   *
   * @param userSeq 조회할 대상 유저
   * @param limit 제한
   * @return GameLogDto[]
   */
  async findRecentGameLog(userSeq: number, limit: number): Promise<GameLog[]> {
    this.logger.debug(`findRecentGameLog : ${userSeq}`);
    const target = await this.MockEntity.filter(
      (e) => e.topUserSeq === userSeq || e.btmUserSeq === userSeq,
    );
    if (limit < 0) {
      return target;
    }
    return target.slice(0, Math.min(target.length, limit));
  }

  /**
   * 해당 유저의 총 게임 수와 이긴 횟수를 조회해준다.
   *
   * @param userSeq 해당 유저 시퀀스
   * @return GameRecordDto {총 횟수, 이긴 횟수}
   */
  async fundUserGameLog(userSeq: number): Promise<GameRecordDto> {
    this.logger.debug(`fundUserGameLog : ${userSeq}`);
    const result: GameRecordDto = {
      total: 0,
      win: 0,
    };

    await this.MockEntity.forEach((e) => {
      if (e.topUserSeq === userSeq || e.btmUserSeq === userSeq) {
        result.total += 1;
        if (e.winnerSeq === userSeq) {
          result.win += 1;
        }
      }
    });

    return result;
  }
}
