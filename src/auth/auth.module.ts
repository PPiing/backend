import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { FtStrategy } from './ft.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [SessionSerializer, FtStrategy],
})
export class AuthModule { }
