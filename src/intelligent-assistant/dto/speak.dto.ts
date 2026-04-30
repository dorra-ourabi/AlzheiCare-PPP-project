import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AssistantContextDto } from './assistant-context.dto';

export class AssistantSpeakDto {
  @IsString()
  @MinLength(1)
  text: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AssistantContextDto)
  context?: AssistantContextDto;
}
