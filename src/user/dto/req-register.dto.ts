import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ReqRegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
