import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module.e2e-spec';
import { AuthController } from './auth.controller';
import { MyMockStrategy } from './mock.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    SessionSerializer,
    MyMockStrategy,
  ],
})
export class AuthModule { }
