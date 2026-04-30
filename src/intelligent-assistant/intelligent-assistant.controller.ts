import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AssistantContextDto } from './dto/assistant-context.dto';
import { AssistantChatDto } from './dto/chat.dto';
import { AssistantSpeakDto } from './dto/speak.dto';
import { AssistantTranscribeDto } from './dto/transcribe.dto';
import { IntelligentAssistantService } from './intelligent-assistant.service';

interface UpstreamErrorResponse {
  status: number;
  message: string;
}

interface UploadedAudioFile {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
}

function getErrorResponse(
  err: unknown,
  fallbackMessage: string,
): UpstreamErrorResponse {
  if (err instanceof Error) {
    const knownError = err as Error & { status?: unknown };
    return {
      status: typeof knownError.status === 'number' ? knownError.status : 502,
      message: err.message || fallbackMessage,
    };
  }

  return { status: 502, message: fallbackMessage };
}

@Controller('intelligent-assistant')
export class IntelligentAssistantController {
  constructor(private readonly assistantService: IntelligentAssistantService) {}

  @Get('health')
  health() {
    return this.assistantService.health();
  }

  @Post('chat')
  chat(
    @Body() dto: AssistantChatDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-dev-bypass') devBypass?: string,
  ) {
    return this.assistantService.chatSync(
      authorization,
      dto,
      devBypass === 'true',
    );
  }

  @Post('chat/stream')
  async chatStream(
    @Body() dto: AssistantChatDto,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-dev-bypass') devBypass: string | undefined,
    @Res() res: Response,
  ) {
    const abortController = new AbortController();

    res.on('close', () => {
      abortController.abort();
    });

    let upstream: globalThis.Response;
    try {
      upstream = await this.assistantService.getStreamResponse(
        authorization,
        dto,
        devBypass === 'true',
        abortController.signal,
      );
    } catch (err: unknown) {
      const { status, message } = getErrorResponse(err, 'AI service error');
      return res.status(status).json({ message });
    }

    if (!upstream.ok || !upstream.body) {
      const message = await upstream.text();
      return res.status(upstream.status).json({ message });
    }

    res.status(upstream.status);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = upstream.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (res.writableEnded) break;
        res.write(Buffer.from(value));
      }
    } catch (err: unknown) {
      const isAbort =
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError');
      if (!isAbort) {
        // unexpected error — log it
        console.error('SSE stream error', err);
      }
    } finally {
      reader.cancel().catch(() => {});
      if (!res.writableEnded) {
        res.end();
      }
    }
  }

  @Delete('history')
  @HttpCode(HttpStatus.OK)
  clearHistory(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-dev-bypass') devBypass: string | undefined,
    @Body() context?: AssistantContextDto,
  ) {
    return this.assistantService.clearHistory(
      authorization,
      context,
      devBypass === 'true',
    );
  }

  @Post('speak')
  async speak(
    @Body() dto: AssistantSpeakDto,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-dev-bypass') devBypass: string | undefined,
    @Res() res: Response,
  ) {
    try {
      const response = await this.assistantService.speak(
        authorization,
        dto,
        devBypass === 'true',
      );
      res.setHeader('Content-Type', response.contentType);
      res.send(response.buffer);
    } catch (err: unknown) {
      const { status, message } = getErrorResponse(err, 'TTS service error');
      res.status(status).json({ message });
    }
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  transcribe(
    @UploadedFile() file: UploadedAudioFile | undefined,
    @Body() dto: AssistantTranscribeDto,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-dev-bypass') devBypass: string | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }
    return this.assistantService.transcribe(
      authorization,
      file,
      dto,
      dto.context,
      devBypass === 'true',
    );
  }
}
