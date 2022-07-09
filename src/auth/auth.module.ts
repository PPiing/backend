import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { FtStrategy } from './ft.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AuthController],
  providers: [SessionSerializer, FtStrategy],
})
export class AuthModule { }
