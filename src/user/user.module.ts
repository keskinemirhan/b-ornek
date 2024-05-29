import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { MailerModule } from "src/mailer/mailer.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailerModule
  ],
  providers: [UserService]
})
export class UserModule {

}
