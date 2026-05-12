import { IsBoolean, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreatePaymentLinkDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsNumberString()
  amountKobo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
