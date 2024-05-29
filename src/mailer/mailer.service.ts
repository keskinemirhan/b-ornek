import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transporter, createTransport } from "nodemailer";
import SMTPPool from "nodemailer/lib/smtp-pool";


type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailerService implements OnModuleInit {

  constructor(private configService: ConfigService) { }


  onModuleInit() {
    if (this.configService.get<boolean>("CONSOLE_MAIL")) {
      this.transporter = {
        sendMail: (args: any) => console.log(args)
      }
    }
    this.transporter = createTransport({
      pool: true,
      host: this.configService.get("SMTP_HOST"),
      port: this.configService.get<number>("SMTP_PORT"),
      secure: false,
      auth: {
        user: this.configService.get("SMTP_USERNAME"),
        pass: this.configService.get("SMTP_PASSWORD"),
      }
    });
  }
  private transporter: Transporter<SMTPPool.SentMessageInfo> | any;

  async sendMail(mailOptions: MailOptions) {
    await this.transporter.sendMail({
      ...mailOptions
    })

  }
}
