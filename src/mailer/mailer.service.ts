import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';

export type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class MailerService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  private from: string;

  onModuleInit() {
    this.from = this.configService.get<string>('MAIL_SENDER');
    if (this.configService.get<boolean>('CONSOLE_MAIL')) {
      this.transporter = {
        sendMail: (args: any) => console.log(args),
      };
    } else {
      this.transporter = createTransport({
        pool: true,
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: this.configService.get<boolean>('SMTP_TLS'),
        auth: {
          user: this.configService.get('SMTP_USERNAME'),
          pass: this.configService.get('SMTP_PASSWORD'),
        },
      });
    }
  }
  private transporter: Transporter<SMTPPool.SentMessageInfo> | any;

  /**
   * Sends email with given options
   * @param mailOptions mail options
   */
  async sendMail(mailOptions: MailOptions) {
    await this.transporter.sendMail({
      from: this.from,
      ...mailOptions,
    });
  }
}
