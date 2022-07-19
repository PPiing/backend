import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module.e2e-spec';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MyMockStrategy } from './mock.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AuthController],
  providers: [
    SessionSerializer,
    MyMockStrategy,
    AuthService,
  ],
})
export class AuthModule { }
