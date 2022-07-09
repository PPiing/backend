import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class UserRankService {
  private readonly logger = new Logger(UserRankService.name);

  constructor(
    private readonly userRankService: UserRankService,
  ) {}

  /**
   * 사용자 랭크 점수 가져오기
   *
   * @param userSeq
   * @return GetRankDto
   */
  async getRank(userSeq: number): Promise<
}
