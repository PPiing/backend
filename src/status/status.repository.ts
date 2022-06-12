import { Injectable } from '@nestjs/common';
import UserStatus from 'src/enums/mastercode/user-status.enum';

@Injectable()
export default class StatusRepository {
  MockEntity: any[] = [];

  constructor() {
    this.MockEntity.push({
      userSeq: 0,
      userID: 0,
      nickName: 'skim',
      email: 'skim@naver.com',
      secAuthStatus: true,
      avatarImgUri: '/img/skim.jpg',
      status: UserStatus.USST20, // offline
    });
    this.MockEntity.push({
      userSeq: 0,
      userID: 0,
      nickName: 'skim2',
      email: 'skim2@naver.com',
      secAuthStatus: true,
      avatarImgUri: '/img/skim2.jpg',
      status: UserStatus.USST20, // offline
    });
  }

  /**
   * 저장되어 있는 user를 조회한 후 상태를 업데이트한다.
   *
   * @param userSeq
   * @param status
   */
  updateStatus(userSeq: number, status: UserStatus) {
    // db의 status값 수정
    const entity = this.MockEntity.find(
      (e) => e.userSeq === userSeq,
    );

    if (entity) {
      entity.status = status;
    }
  }
}
