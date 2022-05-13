import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FtStrategy } from './ft.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  controllers: [AuthController],
  providers: [SessionSerializer, FtStrategy],
})
export default class AuthModule { }
