import { IsBoolean, IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

const EVENT_CATEGORIES = ['medicine', 'appointment', 'mundane'] as const;

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

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
