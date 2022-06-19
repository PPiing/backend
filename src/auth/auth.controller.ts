import {
  Controller, Get, Redirect, Req, Session, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { FtGuard } from './guards/ft.guard';

@Controller('auth')
export class AuthController {
  @Get('42')
  @UseGuards(FtGuard)
  login() { }

  @Get('42/callback')
  @UseGuards(FtGuard)
  @Redirect('../../../', 302)
  callback() { }

  @Get('logout')
  @UseGuards(AuthGuard)
  @Redirect('../../../', 302)
  logout(@Req() req: any) {
    req.logout();
  }

  @Get('data') // NOTE: 로그인 확인용
  @UseGuards(AuthGuard)
  data(@Session() session: any) {
    return session;
  }
}
