import {
  Controller, Get, Redirect, Req, Res, UseGuards, Query, ParseIntPipe, Logger,
} from '@nestjs/common';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private logger: Logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('login')
  @UseGuards(FtGuard)
  login() { }

  @Get('login/callback')
  @UseGuards(FtGuard)
  callback(@Res() req: any, @Res() res: any) {
    if (!this.authService.isSecAuthStatus(req.user)) {
      this.authService.setIsLogin(req.sessionID, 'Y');
      res.redirect('../../../');
      return ;
    }
    res.redirect('../../../auth/redirect');
  }

  @Get('logout')
  @UseGuards(CheckLogin)
  @Redirect('../../../', 302)
  logout(@Req() req: any) {
    this.authService.setIsLogin(req.sessionID, 'N');

    req.logout((err) => {
      if (err) {
        this.logger.error(err);
      }
    });
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
