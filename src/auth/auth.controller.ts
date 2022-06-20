import {
  Controller, Get, Redirect, Req, UseGuards,
} from '@nestjs/common';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';

@Controller('auth')
export class AuthController {
  @Get('login')
  @UseGuards(FtGuard)
  login() { }

  @Get('login/callback')
  @UseGuards(FtGuard)
  @Redirect('../../../', 302)
  callback() { }

  @Get('logout')
  @UseGuards(CheckLogin)
  @Redirect('../../../', 302)
  logout(@Req() req: any) {
    req.logout();
  }
}
