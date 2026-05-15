import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  lenderVisible?: boolean;

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
  @IsIn(["trader", "lender", "admin"])
  role?: "trader" | "lender" | "admin";
}
