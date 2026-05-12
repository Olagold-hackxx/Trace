import { IsNumberString, IsString } from "class-validator";

export class CreateJobDto {
  @IsString()
  title!: string;

  @IsString()
  category!: string;

  @IsNumberString()
  payKobo!: string;

  @IsString()
  durationLabel!: string;

  @IsString()
  location!: string;

  @IsString()
  description!: string;
}
