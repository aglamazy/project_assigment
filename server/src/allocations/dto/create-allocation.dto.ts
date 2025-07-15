import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  @IsNotEmpty()
  team_name: string;

  @IsString()
  @IsNotEmpty()
  project_name: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
  @IsOptional()
  @IsNumber()
  hours?: number;

  @IsOptional()
  override?: boolean;
}
