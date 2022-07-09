import {
  Controller, Get, Redirect, Req, UseGuards,
} from '@nestjs/common';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';
import { MailService } from 'src/mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly mailService: MailService) {}

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
    if (!req.user) {
      // TODO: 401 error return
    }
    if (req.user.secAuthStatus) {
      req.user.is_login = 'N';
      // this.mailService.example();

      // NOTE: 인증 이메일 전송
      // NOTE: 전송 후 리다이렉션하여 이메일 전송했다는 문구 띄우기
    } else {
      req.user.is_login = 'Y';
      console.log('이메일 인증이 필요 없습니다.');
    }
  }
}
