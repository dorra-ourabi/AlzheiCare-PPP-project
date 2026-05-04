import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

const EVENT_CATEGORIES = ['medicine', 'appointment', 'mundane'] as const;

export class UpdateCalendarEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsIn(EVENT_CATEGORIES)
  @IsOptional()
  category?: typeof EVENT_CATEGORIES[number];

  @IsInt()
  @Min(1)
  @IsOptional()
  notifyBefore?: number;

  @IsBoolean()
  @IsOptional()
  repeatDaily?: boolean;

  @IsDateString()
  @IsOptional()
  repeatUntil?: string;

  @IsString()
  @IsOptional()
  seriesId?: string;
}
