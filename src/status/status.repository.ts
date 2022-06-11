import { Injectable } from '@nestjs/common';

@Injectable()
export default class StatusRepository {
  MockEntity: any[] = []; // user 테이블 기반으로 추가

  /**
   * 저장되어 있는 user를 조회한 후 TODO: userRepository에 있다면 import 예정
   * status를 업데이트한다.
   *
   * @param userSeq
   * @param status TODO: enum으로 변경예정
   */
  updateStatus(userSeq: number, status: string) {
	  // db의 status값 수정
  }

}
