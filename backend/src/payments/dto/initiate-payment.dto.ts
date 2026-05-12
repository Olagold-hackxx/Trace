import { IsNumberString, IsOptional, IsString } from "class-validator";

export class InitiatePaymentDto {
  @IsNumberString()
  amountKobo!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  email?: string;
}
