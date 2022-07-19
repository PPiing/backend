import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private logger: Logger = new Logger(MailService.name);

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
        this.logger.log('success!');
      })
      .catch((e) => {
        this.logger.log(`failure! : ${e}`);
      });
  }
}
