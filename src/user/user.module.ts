import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { MailerModule } from '../mailer/mailer.module';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailerModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
