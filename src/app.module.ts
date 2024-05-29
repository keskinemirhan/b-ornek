import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import { envSchema } from './env.validation';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    entities: [User],
    synchronize: true

  }),
    UserModule,
    MailerModule,
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ".env",
    validationSchema: envSchema,
    validationOptions: {
      allowUnknown: true,
      abortEarly: true,
    }
  }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
