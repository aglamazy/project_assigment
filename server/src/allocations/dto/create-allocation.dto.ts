import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  @IsNotEmpty()
  team_name: string;

  @IsString()
  @IsNotEmpty()
  project_name: string;

  @IsDateString()
  date: string;

  @IsNumber()
  hours: number;
}
