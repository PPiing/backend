import {
  Controller, Get, Redirect, Req, UseGuards, Query, ParseIntPipe, Inject, CACHE_MANAGER,
} from '@nestjs/common';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';
import { Cache } from 'cache-manager';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
    if (!this.authService.checkLogin(req.user, req.sessionID)) {
      return;
    }
    await this.authService.sendAuthCodeToEmail(req.user, req.sessionID);
  }

  @Get('factor/code')
  @Redirect('auth/factor/', 302)
  async checkFactorCode(@Req() req: any, @Query('code', ParseIntPipe) code: number): Promise<void> {
    if (!this.authService.checkLogin(req.user, req.sessionID)) {
      return;
    }
    this.authService.checkAuthCodeFromEmail(req.sessionID, code);
  }
}
