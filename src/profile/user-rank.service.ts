import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { GetRankDto } from "./dto/get-rank.dto";
import { RankRepository } from "./repository/rank.repository";

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
      throw new BadRequestException('랭크 정보가 부정확 합니다.');
    }
    const result : GetRankDto = {
      rank_score: rank.rankScore,
      rank_name: '',
    }
    if (rank.rankScore > 0 && rank.rankScore <= 50) {
      result.rank_name
    }
  }
}
