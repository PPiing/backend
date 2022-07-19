import {
  Controller, Get, Redirect, Req, UseGuards, Query, ParseIntPipe,
} from '@nestjs/common';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';
import { Cache } from 'cache-manager';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('login')
  @UseGuards(FtGuard)
  login() { }

  @Get('login/callback')
  @UseGuards(FtGuard)
  @Redirect('../../../', 302)
  callback(@Req() req: any) {
    // TODO : requset의 is_login으로 확인해볼 것
    if (!this.authService.isSecAuthStatus(req.user)) {
      this.authService.setIsLogin(req.sessionID, 'Y');
      return { url: '../../../' };
    }
    return ({ url : '../../../auth/redirect' });
  }

  @Get('logout')
  @UseGuards(CheckLogin)
  @Redirect('../../../', 302)
  logout(@Req() req: any) {
    req.logout();
  }

  @Get('twofactor/check')
  async checkFactor(@Req() req: any):Promise<boolean> {
    if (!this.authService.checkLogin(req.user, req.sessionID)) {
      return false;
    }
    await this.authService.sendAuthCodeToEmail(req.user, req.sessionID);
    return true;
  }

  @Get('twofactor/code')
  async checkFactorCode(@Req() req: any, @Query('code', ParseIntPipe) code: number): Promise<boolean> {
    if (!this.authService.checkLogin(req.user, req.sessionID)) {
      return false;
    }
    const validChk = this.authService.isValidAuthCodeFromEmail(req.sessionID, code);
    return validChk;
  }
}
