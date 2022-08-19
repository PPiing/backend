import {
  Controller, Get, Redirect, Req, Res, UseGuards, Query, ParseIntPipe, Logger,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckLogin } from 'src/guards/check-login.guard';
import { FtGuard } from 'src/guards/ft.guard';
import { UserDto } from 'src/user/dto/user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from './auth.service';
import { User } from './user.decorator';

@ApiTags('인가/인증 관련')
@Controller('auth')
export class AuthController {
  private logger: Logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private eventRunner: EventEmitter2,
  ) {}

  @ApiOperation({
    summary: '로그인',
    description: '42 계정으로 OAuth 로그인을 시도합니다. 성공시 login/callback으로 리다이렉트합니다.',
  })
  @Get('login')
  @UseGuards(FtGuard)
  login() { }

  @ApiOperation({
    summary: '로그인 콜백 엔드포인트',
    description: '로그인 성공시 해당 URI로 자동으로 리다이렉트 되며 http://(host) 로 리다이렉트 합니다. 2FA를 필요로 하는 계정일시 http://(host)/auth/redirect 로 리다이렉트 합니다.',
  })
  @Get('login/callback')
  @UseGuards(FtGuard)
  callback(
  @User() user: UserDto,
    @Res() res: any,
  ) {
    if (!this.authService.isSecAuthStatus(user)) {
      this.authService.setIsLogin(user, 'Y');
      res.redirect('../../../');
      return;
    }
    res.redirect('../../../auth/redirect');
  }

  @ApiOperation({
    summary: '첫 로그인 여부',
    description: '첫 로그인 여부를 리턴합니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 여부 리턴' })
  @ApiResponse({ status: 401, description: '로그인 필요' })
  @Get('login/firstlogin')
  @UseGuards(CheckLogin)
  async firstlogin(
    @User() user: UserDto,
  ): Promise<boolean> {
    return (user.firstLogin);
  }

  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃을 수행합니다.',
  })
  @Get('logout')
  @UseGuards(CheckLogin)
  @Redirect('../../../', 302)
  logout(
  @User() user: UserDto,
    @Req() req: any,
  ) {
    this.authService.setIsLogin(user, 'N');
    this.eventRunner.emit('event:logout', user.userSeq);
    req.logout((err) => {
      if (err) {
        this.logger.error(err);
      }
    });
  }

  @ApiOperation({
    summary: '2FA 인증 여부 및 메일 송부',
    description: '2FA 인증 여부를 true/false로 리턴하며 인증 메일을 송부합니다.',
  })
  @Get('twofactor/check')
  async checkFactor(
    @User() user: UserDto,
  ):Promise<boolean> {
    if (!this.authService.checkLogin(user)) {
      return false;
    }
    await this.authService.sendAuthCodeToEmail(user);
    return true;
  }

  @ApiOperation({
    summary: '2FA 인증 수행',
    description: '메일로부터 송부받은 코드를 이용하여 2FA 인증을 진행합니다. 진행 성공 여부는 true/false로 리턴합니다.',
  })
  @Get('twofactor/code')
  // @UseGuards(CheckLogin)
  async checkFactorCode(
    @User() user: UserDto,
      @Query('code', ParseIntPipe) code: number,
  ): Promise<boolean> {
    // if (!this.authService.checkLogin(user)) {
    //   return false;
    // }
    const validChk = this.authService.isValidAuthCodeFromEmail(user, code);
    return validChk;
  }
}
