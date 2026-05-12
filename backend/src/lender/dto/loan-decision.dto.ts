import { IsIn, IsOptional, IsString } from "class-validator";

export class LoanDecisionDto {
  @IsString()
  @IsIn(["approve", "decline"])
  decision!: "approve" | "decline";

  @IsOptional()
  @IsString()
  note?: string;
}
