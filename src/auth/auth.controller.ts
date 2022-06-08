import {
  Controller, Get, Logger, Redirect, Req, UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
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
  @Redirect('http://bongcheonmountainclub.iptime.org/', 302) // login url
  callback(@Req() req: any) {
    // sign up user
    const [userId, email] = [req.user.userId, req.user.email];
    const result = this.userService.createByUserId(userId, email);
    Logger.debug(result);
    return result;
  }
}
