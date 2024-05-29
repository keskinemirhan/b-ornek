import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ReqRegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @IsEmail()
  email: string;
}
