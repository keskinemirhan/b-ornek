import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../src/user/user.module';
import { MailerModule } from '../src/mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from '../src/user/user.service';
import { MailerService } from '../src/mailer/mailer.service';
import { MailOptions } from 'nodemailer/lib/json-transport';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let userService: UserService;
  let mailerService: MailerService;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        UserModule,
        MailerModule,
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          database: ':memory:',
          type: 'sqlite',
          dropSchema: true,
          synchronize: true,
          entities: [User],
        }),
        TypeOrmModule.forFeature([User]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const repositoryToken = getRepositoryToken(User);
    userRepo = app.get<Repository<User>>(repositoryToken);
    userService = app.get<UserService>(UserService);
    mailerService = app.get<MailerService>(MailerService);

    jest
      .spyOn(mailerService, 'sendMail')
      .mockImplementation(async (m: MailOptions) => {});
  });

  test('POST [user/register]', async () => {
    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        username: 'name',
        email: 'email@email.com',
      })
      .expect(201);
  }, 500);

  test('POST [user/register] existing email', async () => {
    await userService.register('existing1@mail.com', 'existing1');
    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        username: 'nonexisting1',
        email: 'existing1@mail.com',
      })
      .expect(400);
  }, 500);

  test('POST [user/register] existing username', async () => {
    await userService.register('existing2@mail.com', 'existing2');
    return request(app.getHttpServer())
      .post('/user/register')
      .send({
        username: 'existing2',
        email: 'nonexisting2@mail.com',
      })
      .expect(400);
  }, 500);

  test('GET [user/verify-email/:username/:token]', async () => {
    await userService.register('email2@email', 'name2');
    const user = await userRepo.findOne({ where: { name: 'name2' } });
    const verificationToken = user.verificationToken;
    return request(app.getHttpServer())
      .get('/user/verify-email/name2/' + verificationToken)
      .expect(200);
  }, 500);

  test('GET [user/verify-email/:username/:token] invalid token', async () => {
    await userService.register('email3@email', 'name3');
    const verificationToken = 'invalidtoken';
    return request(app.getHttpServer())
      .get('/user/verify-email/name3/' + verificationToken)
      .expect(400);
  }, 500);

  test('GET [user/verify-email/:username/:token] nonexisting user', async () => {
    const verificationToken = 'token';
    return request(app.getHttpServer())
      .get('/user/verify-email/nonexisting/' + verificationToken)
      .expect(404);
  }, 500);

  test('GET [user/check-verification/:username] not verified', async () => {
    await userService.register('email4@email.com', 'name4');
    return request(app.getHttpServer())
      .get('/user/check-verification/name4')
      .expect(200)
      .expect('user is not verified');
  }, 500);

  test('GET [user/check-verification/:username] verified', async () => {
    await userService.register('email5@email.com', 'name5');
    const user = await userRepo.findOne({ where: { name: 'name5' } });
    user.isVerified = true;
    await userRepo.save(user);
    return request(app.getHttpServer())
      .get('/user/check-verification/name5')
      .expect(200)
      .expect('user is verified');
  }, 500);

  test('GET [user/check-verification/:username] not found', async () => {
    return request(app.getHttpServer())
      .get('/user/check-verification/nonexisting')
      .expect(404);
  }, 500);
});
