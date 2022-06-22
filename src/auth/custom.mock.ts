import { Strategy } from 'passport';

type DoneCallback = (error: Error, OAuthId: number, email: string, login: string) => void;
type VerifyFunction = (OAuthId: number, email: string, login: string, done: DoneCallback) => void;

export default class MockStrategy extends Strategy {
  [x: string]: any;

  private verify?: VerifyFunction;

  constructor(verify?: VerifyFunction) {
    super();
    this.verify = verify;
  }

  public authenticate() {
    const verified: DoneCallback = (error, user, email, login) => {
      this.success(user, email, login); // NOTE: Strategy type이 지정되어 있지 않아 빨간줄 뜰수있음
    };
    this.verify(10, 'skim@student.42seoul.kr', 'skim', verified); // NOTE: 목업 데이터의 OAuth ID가 10인 사람 (사용자 아이디는 1임)임
  }
}
