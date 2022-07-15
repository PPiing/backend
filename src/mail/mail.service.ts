import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public example(emailAddress: string, content: string): void {
    this.mailerService
      .sendMail({
        to: emailAddress, // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: `인증코드: <b><mark>${content}</mark></b>`, // HTML body content
      })
      .then(() => {
        console.log('success!');
      })
      .catch((e) => {
        console.log('failure!');
      });
  }
}
