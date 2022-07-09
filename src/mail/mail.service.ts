import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public example(): void {
    this.mailerService
      .sendMail({
        to: 'dev.yamkim@gmail.com', // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome</b>', // HTML body content
      })
      .then(() => {
        console.log('success!');
      })
      .catch((e) => {
        console.log(process.env.MAILDEV_INCOMING_USER);
        console.log(process.env.MAILDEV_INCOMING_PASS);
        console.error(e);
        console.log('failure!');
      });
  }
}
