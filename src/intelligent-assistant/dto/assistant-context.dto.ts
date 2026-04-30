import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AssistantContextDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  patientAge?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  patientStage?: number;
}
