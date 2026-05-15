import { IsOptional, IsString, Length, MinLength } from "class-validator";

export class LoginDto {
  @IsOptional()
  @IsString()
  @Length(10, 16)
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
