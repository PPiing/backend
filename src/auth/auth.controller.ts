import {
  Controller, Get, Logger, Redirect, Req, Session, UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from './guards/auth.guard';
import { FtGuard } from './guards/ft.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) { }

  @Get('42')
  @UseGuards(FtGuard)
  login() {
  }

  @Get('42/callback')
  @UseGuards(FtGuard)
  @Redirect('../../../', 302)
  callback(@Req() req: any) {
    // sign up user
    const [userId, email] = [req.user.userId, req.user.email];
    const result = this.userService.findByUserId(userId);

    if (result) {
      return result;
    }
    const newResult = this.userService.createByUserId(userId, email);
    Logger.debug(newResult);
    return newResult;
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  @Redirect('../../../', 302)
  logout(@Req() req: any) {
    req.logout();
    return 'logout';
  }

  @Get('data') // NOTE: 로그인 확인용
  @UseGuards(AuthGuard)
  data(@Session() session: any) {
    return session;
  }
}
