import { Module } from '@nestjs/common';
import { MailerModule, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import MailerConfigService from 'src/configs/mailer.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MailerConfigService,
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
