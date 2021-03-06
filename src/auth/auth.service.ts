import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { readFileSync, writeFileSync } from 'fs';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getRandomCode(): number {
    return Math.floor(Math.random() * (10000 - 1000)) + 1000;
  }

  private cvtFileDataToObject = (fileName: string): any => {
    let sessionData;
    try {
      const file = readFileSync(fileName, 'utf8');
      sessionData = JSON.parse(file);
      return sessionData;
    } catch (err) {
      // console.error(err);
      return {};
    }
  };

  private cvtObjectDataToFile = (fileName: string, data: object): void => {
    writeFileSync(fileName, JSON.stringify(data));
  };

  checkLogin(user: any, sessionID: string): boolean {
    const fileName = `sessions/${sessionID}.json`;
    const sessionData = this.cvtFileDataToObject(fileName);
    if (!user || Object.keys(sessionData).length === 0) {
      this.logger.log('로그인을 다시 해야합니다.');
      return false;
    }
    return true;
  }

  isSecAuthStatus(user: any): boolean {
    if (!user.secAuthStatus) {
      this.logger.log('two factor 인증을 하지 않아도 되는 계정입니다.');
      return false;
    }
    return true;
  }

  setIsLogin(sessionID, flag): void {
    const fileName = `sessions/${sessionID}.json`;
    const sessionData = this.cvtFileDataToObject(fileName);
    sessionData.passport.user.is_login = flag;
    this.cvtObjectDataToFile(fileName, sessionData);
  }

  // TODO: user DB에 있는 이메일에 전송하는 방식으로 수정하기
  async sendAuthCodeToEmail(user: any, sessionID: string): Promise<void> {
    // TODO: auth code를 랜덤으로 생성하도록 수정합니다.
    // TODO: auth code 만기 시간을 정하도록 수정합니다.
    const factorCode = this.getRandomCode();
    await this.cacheManager.set(sessionID, factorCode);
    if (user.secAuthStatus) {
      this.setIsLogin(sessionID, 'N');
      // NOTE: 인증 이메일 전송
      // NOTE: 전송 후 리다이렉션하여 이메일 전송했다는 문구 띄우기
      this.mailService.example('dev.yamkim@gmail.com', String(factorCode));
    } else {
      // NOTE: 이차인증을 수행하지 경우로, 바로 is_login을 'Y'로 설정합니다.
      this.setIsLogin(sessionID, 'Y');
    }
  }

  async isValidAuthCodeFromEmail(sessionID: string, code: number): Promise<boolean> {
    const fileName = `sessions/${sessionID}.json`;
    const sessionData = this.cvtFileDataToObject(fileName);

    // TODO: auth code를 랜덤으로 생성하도록 수정합니다.
    // TODO: auth code 만기 시간을 정하도록 수정합니다.
    const authCode = await this.cacheManager.get(sessionID);
    if (code === authCode) {
      // NOTE: 이차인증을 성공하는 경우로, 드디어 is_login을 'Y'로 설정합니다.
      this.logger.log('코드를 제대로 입력하였습니다.');
      sessionData.passport.user.is_login = 'Y';
      this.cvtObjectDataToFile(fileName, sessionData);
      return true;
    }
    // NOTE: 이차인증 코드가 잘못된 경우입니다. 다시 인증 화면으로 리다이렉션 시킵니다.
    this.logger.log('코드를 잘못입력하였습니다.');
    sessionData.passport.user.is_login = 'N';
    this.cvtObjectDataToFile(fileName, sessionData);
    return false;
  }
}
