import { IsOptional, IsString, Length } from "class-validator";

export class LoginDto {
  @IsOptional()
  @IsString()
  @Length(10, 16)
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @Length(4, 64)
  password!: string;
}
