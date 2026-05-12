import { IsString, Length } from "class-validator";

export class LoginDto {
  @IsString()
  @Length(10, 16)
  phone!: string;

  @IsString()
  @Length(4, 64)
  password!: string;
}
