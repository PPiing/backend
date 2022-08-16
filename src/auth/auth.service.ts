import {
  CACHE_MANAGER, Inject, Injectable, Logger,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { Cache } from 'cache-manager';
import { UserDto } from 'src/user/dto/user.dto';

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

  checkLogin(user: UserDto | undefined): boolean {
    if (user && user.isLogin !== 'Y') {
      return true;
    }
    return false;
  }

  isSecAuthStatus(user: any): boolean {
    if (!user.secAuthStatus) {
      this.logger.log('two factor 인증을 하지 않아도 되는 계정입니다.');
      return false;
    }
    return true;
  }

  setIsLogin(user: UserDto, flag): void {
    // eslint-disable-next-line no-param-reassign
    user.isLogin = flag;
  }

  async sendAuthCodeToEmail(user: UserDto): Promise<void> {
    const factorCode = this.getRandomCode();
    await this.cacheManager.set(`session-${user.userSeq}`, factorCode);
    if (user.secAuthStatus) {
      this.setIsLogin(user, 'N');
      // NOTE: 인증 이메일 전송
      // NOTE: 전송 후 리다이렉션하여 이메일 전송했다는 문구 띄우기
      this.mailService.example(user.email, String(factorCode));
    } else {
      // NOTE: 이차인증을 수행하지 경우로, 바로 isLogin을 'Y'로 설정합니다.
      this.setIsLogin(user, 'Y');
    }
  }

  async isValidAuthCodeFromEmail(user: UserDto, code: number): Promise<boolean> {
    const authCode = await this.cacheManager.get(`session-${user.userSeq}`);
    if (code === authCode) {
      // NOTE: 이차인증을 성공하는 경우로, 드디어 isLogin을 'Y'로 설정합니다.
      this.logger.log('코드를 제대로 입력하였습니다.');
      this.setIsLogin(user, 'Y');
      return true;
    }
    // NOTE: 이차인증 코드가 잘못된 경우입니다. 다시 인증 화면으로 리다이렉션 시킵니다.
    this.logger.log('코드를 잘못 입력하였습니다.');
    this.setIsLogin(user, 'N');
    return false;
  }
}
