import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';

@Injectable()
export class UserService {
  private emailVerificationTemplate: any;
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailerService: MailerService,
  ) {
    const verificationTemplateHbs = readFileSync(
      __dirname + '/../../assets/emailVerificationTemplate.hbs',
      'utf-8',
    );
    const emailVerificationTemplate = verificationTemplateHbs;
    this.emailVerificationTemplate = Handlebars.compile(
      emailVerificationTemplate,
    );
  }

  /**
   * Sends verification email to specified email
   * @param name name of the user
   * @param email destination email
   * @param token verification token
   * @param link verification link
   *
   */
  async sendVerificationEmail(
    name: string,
    email: string,
    token: string,
    link: string,
  ) {
    const verificationLink = join(link, token);
    const html = this.emailVerificationTemplate({
      username: name,
      verificationLink,
    });
    this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      html,
    });
  }

  /**
   * Creates random alphanumeric token
   * @returns random alphanumeric token
   */
  createVerificationToken() {
    const randomAlphaNumeric = (length: number) => {
      let s = '';
      Array.from({ length }).some(() => {
        s += Math.random().toString(36).slice(2);
        return s.length >= length;
      });
      return s.slice(0, length);
    };

    return randomAlphaNumeric(10);
  }

  /**
   * Registers user
   * @param email email of the user
   * @param name name of the user
   * @returns registered user
   * @throws {BadRequestException} if username or email already exists
   */
  async register(email: string, name: string) {
    const existingMail = await this.userRepo.findOne({ where: { email } });
    if (existingMail)
      throw new BadRequestException({ message: 'Email already exists' });
    const existingUsername = await this.userRepo.findOne({ where: { name } });
    if (existingUsername)
      throw new BadRequestException({ message: 'Username already exists' });
    const user = this.userRepo.create();
    user.name = name;
    user.email = email;
    user.isVerified = false;
    user.verificationToken = this.createVerificationToken();
    return await this.userRepo.save(user);
  }

  /**
   * verifies email with given token
   * @param token verification token of the user
   * @param name name of the user
   * @throws {Badrequestexception} if token does not match
   * @throws {Notfoundexception} if user not found
   */
  async verifyEmailAddress(name: string, token: string) {
    const user = await this.userRepo.findOne({ where: { name } });
    if (!user) throw new NotFoundException({ message: 'User not found' });
    if (user.verificationToken !== token)
      throw new BadRequestException({
        message: 'Verification code does not match',
      });
    user.isVerified = true;
    await this.userRepo.save(user);
  }

  /**
   * controls email verification of the user
   * @param name name of the user
   * @returns boolean if user is verified returns true else false
   * @throws {Notfoundexception} if user not found
   */
  async controlVerification(name: string) {
    const user = await this.userRepo.findOne({ where: { name } });
    if (!user) throw new NotFoundException({ message: 'User not found' });
    return user.isVerified;
  }
}
