import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RankType } from 'src/enums/rank-type.enum';
import { GetRankDto } from './dto/get-rank.dto';
import { RankRepository } from './repository/rank.repository';

@Injectable()
export class UserRankService {
  private readonly logger = new Logger(UserRankService.name);

  constructor(
    private readonly rankRepository: RankRepository,
  ) {}

  /**
   * 사용자 랭크 점수 가져오기
   *
   * @param userSeq
   * @return GetRankDto
   */
  async getUserRank(userSeq: number): Promise<GetRankDto> {
    const rank = await this.rankRepository.getRank(userSeq);

    if (rank === undefined) {
      throw new BadRequestException(`${userSeq} 의 랭크정보가 유효하지 않습니다.`);
    }
    const result : GetRankDto = {
      rank_score: rank.rankScore,
      rank_name: '',
    };
    if (rank.rankScore <= -50 || rank.rankScore === undefined) {
      result.rank_name = RankType.RANK01;
    } else if (rank.rankScore > -50 && rank.rankScore <= 150) {
      result.rank_name = RankType.RANK02;
    } else if (rank.rankScore > 150 && rank.rankScore <= 300) {
      result.rank_name = RankType.RANK03;
    } else if (rank.rankScore > 300 && rank.rankScore <= 500) {
      result.rank_name = RankType.RANK04;
    } else if (rank.rankScore > 500 && rank.rankScore <= 1000) {
      result.rank_name = RankType.RANK05;
    } else {
      result.rank_name = RankType.RANK06;
    }

    return result;
  }

  async saveWinUser(userSeq: number) {
    await this.rankRepository.saveWinUser(userSeq);
  }

  async saveLoseUser(userSeq: number) {
    await this.rankRepository.saveLoseUser(userSeq);
  }
}
