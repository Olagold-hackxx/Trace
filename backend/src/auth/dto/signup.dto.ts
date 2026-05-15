import { IsIn, IsOptional, IsString, Length, MinLength } from "class-validator";

export class SignupDto {
  @IsString()
  @Length(10, 16)
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsString()
  @Length(11, 11)
  bvn!: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  marketName?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  @IsIn(["trader", "lender", "admin"])
  role?: "trader" | "lender" | "admin";
}
