import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module';
import { MailOptions, MailerService } from '../mailer/mailer.service';
import { ConfigModule } from '@nestjs/config';

describe('UserService', () => {
  let userRepo: Repository<User>;
  let userService: UserService;
  let mailerService: MailerService;
  const userRepoToken = getRepositoryToken(User);
  const mails: MailOptions[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule,
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
      ],
      providers: [UserService],
    }).compile();

    mailerService = module.get<MailerService>(MailerService);
    userService = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(userRepoToken);
    jest
      .spyOn(mailerService, 'sendMail')
      .mockImplementation(async (mailOptions: MailOptions) => {
        mails.push(mailOptions);
      });
  });

  it('Should register user', async () => {
    const registerEmail = 'email@email.com';
    const registerName = 'Name';
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(undefined);
    await userService.register(registerEmail, registerName);
    expect(
      userRepo.findOne({ where: { email: registerEmail, name: registerName } }),
    ).toBeTruthy();
  });

  it('Should throw BadRequestException if email already exists', async () => {
    const registerEmail = 'existing@email.com';
    const registerName = 'nonexisting';
    await userService.register(registerEmail, 'nonexisting');
    try {
      await userService.register(registerEmail, registerName);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });

  it('Should throw BadRequestException if username already exists', async () => {
    const registerEmail = 'nonexisting@email.com';
    const registerName = 'existing';
    await userService.register(registerEmail, registerName);

    try {
      await userService.register('nonexisting@email.com', registerName);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });

  it('Should create verification token correctly ', async () => {
    const email = 'sendme@email.com';
    const name = 'sendme';
    await userService.register(email, name);
    const registered = await userRepo.findOne({ where: { email } });
    expect(registered.verificationToken).toBeTruthy();
  });

  it('Should verify email correctly', async () => {
    const email = 'verify@mail.com';
    const name = 'verify';
    await userService.register(email, name);
    const user = await userRepo.findOne({ where: { name } });
    await userService.verifyEmailAddress(name, user.verificationToken);
    const verified = await userRepo.findOne({ where: { name } });
    expect(verified.isVerified).toBeTruthy();
  });

  it('Should generate unique verification token', () => {
    expect(
      userService.createVerificationToken() ===
        userService.createVerificationToken(),
    ).toBeFalsy();
  });

  it('Should throw BadRequestException if verification token does not match', async () => {
    const email = 'noverify@mail.com';
    const name = 'noverify';
    await userService.register(email, name);
    try {
      await userService.verifyEmailAddress(name, 's');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });

  it('Should send verification email', async () => {
    await userService.sendVerificationEmail(
      'name',
      'email@email',
      'token',
      'link',
    );
    const mail = mails.find((m) => m.to === 'email@email');
    expect(mail).not.toBeUndefined();
  });
});
