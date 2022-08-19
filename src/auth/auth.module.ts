import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FtStrategy } from './ft.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UserModule,
    MailModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [
    SessionSerializer,
    FtStrategy,
    AuthService,
  ],
})
export class AuthModule { }
