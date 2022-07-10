import {
  Controller, Get, Redirect, Req, UseGuards, Query, ParseIntPipe,
} from '@nestjs/common';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';
import { MailService } from 'src/mail/mail.service';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly mailService: MailService) {}

  validCode = 1234;

  cvtFileDataToObject = (fileName: string): any => {
    const file = readFileSync(fileName, 'utf8');
    const sessionData = JSON.parse(file);
    return sessionData;
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
  checkFactor(@Req() req: any) {
    const fileName = `sessions/${req.sessionID}.json`;
    // TODO: req.user가 없다는 말은 로그인을 시도조차 하지 않은 경우입니다.
    const sessionData = this.cvtFileDataToObject(fileName);
    if (!req.user) {
      // TODO: 401 error return
    }
    if (req.user.secAuthStatus) {
      sessionData.passport.user.is_login = 'N';
      this.cvtObjectDataToFile(fileName, sessionData);
      // NOTE: 인증 이메일 전송
      // NOTE: 전송 후 리다이렉션하여 이메일 전송했다는 문구 띄우기
      // this.mailService.example();
      console.log('2차 인증을 위한 이메일이 전송되었습니다.');
    } else {
      sessionData.passport.user.is_login = 'Y';
      this.cvtObjectDataToFile(fileName, sessionData);
      console.log('이메일 인증이 필요 없습니다.');
    }
  }

  @Get('factor/code')
  @Redirect('../../../', 302)
  checkFactorCode(@Req() req: any, @Query('code', ParseIntPipe) code: number): void {
    const fileName = `sessions/${req.sessionID}.json`;
    const sessionData = this.cvtFileDataToObject(fileName);
    if (!req.user) {
      // TODO: 401 error return -> '/factor' api를 사용하는 클라이언트 쪽으로 리다이렉션 시킵니다.
    }
    if (req.user.is_login === 'Y') {
      return;
    }
    if (code === this.validCode) {
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
