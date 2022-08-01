import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GetAchivDto } from './dto/get-achiv.dto';
import { AchivRepository } from './repository/achiv.repository';
import { UserAchivRepository } from './repository/user-achiv.repository';

@Injectable()
export class UserAchivService {
  private readonly logger = new Logger(UserAchivService.name);

  constructor(
    private readonly userAchivRepository : UserAchivRepository,
    private readonly achivRepository : AchivRepository,
  ) {}

  /**
   * 해당 업적 가져오기
   *
   * @param userSeq
   * @return 달성 업적 list
   */
  async getUserAchiv(userSeq: number): Promise<GetAchivDto []> {
    this.logger.log(`달성 업적 리스트 조회 요청 : ${userSeq}`);

    const achives = await this.achivRepository.getAchiv();
    if (achives === undefined) {
      throw new BadRequestException('등록된 업적이 없습니다.');
    }
    const result : GetAchivDto[] = [];
    const achivesComplete = await Promise.all(
      achives.map((achive) => this.userAchivRepository.getUserAchiv(achive.achivSeq, userSeq)),
    );
    for (let i = 0; i < achives.length; i += 1) {
      result.push({
        achiv_seq: achives[i].achivSeq,
        achiv_title: achives[i].achivTitle,
        achiv_image: achives[i].achivImgUri,
        achiv_complete: achivesComplete[i],
      });
    }

    return result;
  }
}
