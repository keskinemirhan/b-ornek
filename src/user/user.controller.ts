import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReqRegisterDto } from './dto/req-register.dto';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  private verificationUrl: string;
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    this.verificationUrl = join(
      this.configService.get<string>('APP_URL'),
      'user',
      'verify-email',
    );
  }

  @ApiBody({
    type: ReqRegisterDto,
  })
  @ApiOkResponse({
    description: 'If user successfully registered',
  })
  @ApiBadRequestResponse({ description: 'If email or username already exists' })
  @Post('register')
  async register(@Body() registerDto: ReqRegisterDto) {
    const user = await this.userService.register(
      registerDto.email,
      registerDto.username,
    );
    const verificationLink = join(this.verificationUrl, user.name);
    await this.userService.sendVerificationEmail(
      user.name,
      user.email,
      user.verificationToken,
      verificationLink,
    );
  }

  @ApiParam({ name: 'name', description: 'name of the user' })
  @ApiParam({ name: 'token', description: 'verification token' })
  @ApiOkResponse({ description: 'If user successfully verified' })
  @ApiNotFoundResponse({ description: 'If user not found' })
  @ApiBadRequestResponse({ description: 'If verification code is invalid' })
  @Get('verify-email/:name/:token')
  async verifyEmail(
    @Param('name') name: string,
    @Param('token') token: string,
  ) {
    await this.userService.verifyEmailAddress(name, token);
  }

  @ApiParam({ name: 'token', description: 'verification token' })
  @ApiBody({
    type: String,
    description: "returns 'user is verified' or 'user is not verified'",
  })
  @ApiOkResponse({ description: 'If user is found' })
  @ApiNotFoundResponse({ description: 'If user not found' })
  @Get('check-verification/:name')
  async checkVerification(@Param('name') name: string) {
    const verified = await this.userService.controlVerification(name);
    if (!verified) return 'user is not verified';
    return 'user is verified';
  }
}
