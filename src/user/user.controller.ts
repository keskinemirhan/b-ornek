import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ReqRegisterDto } from "./dto/req-register.dto";
import { UserService } from "./user.service";
import { ConfigService } from "@nestjs/config";
import { join } from "path";

@Controller("user")
export class UserController {
  private verificationUrl: string;
  constructor(private userService: UserService, private configService: ConfigService) {
    this.verificationUrl = join(this.configService.get<string>("APP_URL"), "user", "verify-email");
  }

  @Post("register")
  async register(@Body() registerDto: ReqRegisterDto) {
    const user = await this.userService.register(registerDto.email, registerDto.username);
    const verificationLink = join(this.verificationUrl, user.name);
    await this.userService.sendVerificationEmail(user.name, user.email, user.verificationToken, verificationLink);
  }

  @Get("verify-email/:name/:token")
  async verifyEmail(@Param("name") name: string, @Param("token") token: string) {
    await this.userService.verifyEmailAddress(name, token);
  }

  @Get("check-verification/:name")
  async checkVerification(@Param("name") name: string) {
    const verified = await this.userService.controlVerification(name);
    if (!verified) return "user is not verified";
    return "user is verified";
  }



}
