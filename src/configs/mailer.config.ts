import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class MailerConfigService implements MailerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMailerOptions(): MailerOptions | Promise<MailerOptions> {
    return {
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: this.configService.get('mail.user'),
          pass: this.configService.get('mail.pass'),
        },
      },
    };
  }
}
