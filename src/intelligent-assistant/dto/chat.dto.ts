import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AssistantContextDto } from './assistant-context.dto';

export class AssistantChatDto {
  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AssistantContextDto)
  context?: AssistantContextDto;
}
