import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { AssistantContextDto } from './assistant-context.dto';

function parseContextValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export class AssistantTranscribeDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseContextValue(value))
  @ValidateNested()
  @Type(() => AssistantContextDto)
  context?: AssistantContextDto;
}
