import {
  Controller, Get, Redirect, Req, UseGuards, Query, ParseIntPipe, Inject, CACHE_MANAGER,
} from '@nestjs/common';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';
import { MailService } from 'src/mail/mail.service';
import { readFileSync, writeFileSync } from 'fs';
import { Cache } from 'cache-manager';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getRandomCode(): number {
    return Math.floor(Math.random() * (10000 - 1000)) + 1000;
  }

  cvtFileDataToObject = (fileName: string): any => {
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

  cvtObjectDataToFile = (fileName: string, data: object): void => {
    writeFileSync(fileName, JSON.stringify(data));
  };

  @Get('login')
  @UseGuards(FtGuard)
  login() { }

  @Get('login/callback')
  @UseGuards(FtGuard)
  @Redirect('../../../', 302)
  callback() {}

  @Get('logout')
  @UseGuards(CheckLogin)
  @Redirect('../../../', 302)
  logout(@Req() req: any) {
    req.logout();
  }

  @Get('factor')
  @Redirect('/auth/factor/window', 302)
  async checkFactor(@Req() req: any):Promise<void> {
    const fileName = `sessions/${req.sessionID}.json`;
    const sessionData = this.cvtFileDataToObject(fileName);
    if (!req.user || sessionData === {}) {
      // TODO: 401 error return
      console.log('로그인을 다시해야합니다.');
      return;
    }
    // TODO: auth code를 랜덤으로 생성하도록 수정합니다.
    // TODO: auth code 만기 시간을 정하도록 수정합니다.
    const factorCode = this.getRandomCode();
    await this.cacheManager.set(req.sessionID, factorCode);
    if (req.user.secAuthStatus) {
      sessionData.passport.user.is_login = 'N';
      this.cvtObjectDataToFile(fileName, sessionData);
      // NOTE: 인증 이메일 전송
      // NOTE: 전송 후 리다이렉션하여 이메일 전송했다는 문구 띄우기
      this.mailService.example('dev.yamkim@gmail.com', String(factorCode));
      console.log('2차 인증을 위한 이메일이 전송되었습니다.');
    } else {
      sessionData.passport.user.is_login = 'Y';
      this.cvtObjectDataToFile(fileName, sessionData);
      console.log('이메일 인증이 필요 없습니다.');
    }
  }

  @Get('factor/code')
  @Redirect('../../../', 302)
  async checkFactorCode(@Req() req: any, @Query('code', ParseIntPipe) code: number): Promise<void> {
    const fileName = `sessions/${req.sessionID}.json`;
    const sessionData = this.cvtFileDataToObject(fileName);
    if (!req.user || sessionData === {}) {
      // TODO: 401 error return -> '/factor' api를 사용하는 클라이언트 쪽으로 리다이렉션 시킵니다.
      console.log('로그인을 다시해야합니다.');
      return;
    }
    if (req.user.is_login === 'Y') {
      console.log('2차 인증을 하지 않아도 되는 유저입니다.');
      return;
    }

    const authCode = await this.cacheManager.get(req.sessionID);
    console.log('입력된 code ============================');
    console.log(code);
    console.log('저장된 code ============================');
    console.log(authCode);
    if (code === authCode) {
      sessionData.passport.user.is_login = 'Y';
      this.cvtObjectDataToFile(fileName, sessionData);
      req.user.is_login = 'Y';
      console.log('2차 인증에 성공하였습니다.');
    } else {
      sessionData.passport.user.is_login = 'N';
      this.cvtObjectDataToFile(fileName, sessionData);
      console.log('2차 인증에 실패했습니다.');
    }
  }
}
