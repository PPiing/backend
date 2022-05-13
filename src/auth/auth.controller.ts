import {
  Controller, Get, Logger, Redirect, Req, UseGuards,
} from '@nestjs/common';
import { FtGuard } from './guards/ft.guard';

@Controller('auth')
export class AuthController {
  @Get('42')
  @UseGuards(FtGuard)
  login() {
  }

  @Get('42/callback')
  @UseGuards(FtGuard)
  @Redirect('/', 302)
  callback(@Req() req: any) {
  }
}
