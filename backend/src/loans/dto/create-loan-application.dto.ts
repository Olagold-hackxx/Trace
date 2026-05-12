import { IsNumberString, IsString } from "class-validator";

export class CreateLoanApplicationDto {
  @IsNumberString()
  amountKobo!: string;

  @IsString()
  purpose!: string;

  @IsString()
  tenor!: string;

  @IsString()
  revenueSource!: string;

  @IsString()
  proposal!: string;
}
