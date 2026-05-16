import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

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

  // Worker profile
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  workerCategory?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRateKobo?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  serviceRadiusKm?: number;
}
