import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AssistantContextDto } from './dto/assistant-context.dto';
import { AssistantChatDto } from './dto/chat.dto';
import { AssistantSpeakDto } from './dto/speak.dto';
import { AssistantTranscribeDto } from './dto/transcribe.dto';
import { safeFetch } from './utils/safe-fetch';

type FastApiRole = 'caregiver' | 'doctor' | 'admin';
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

interface UploadedAudioFile {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
}

interface BinaryResponse {
  buffer: Uint8Array;
  contentType: string;
}

interface AppTokenPayload {
  username?: string;
  role?: string;
}

interface AiTokenPayload {
  sub: string;
  role: FastApiRole;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_stage: number;
}

@Injectable()
export class IntelligentAssistantService {
  private readonly fastApiBaseUrl: string;
  private readonly internalApiKey: string;
  private readonly aiJwtSecret: string;
  private readonly aiJwtAlgorithm: string;
  private readonly requestTimeoutMs: number;
  private readonly isProduction: boolean;
  private readonly allowDevBypass: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const appEnv = (
      this.configService.get<string>('APP_ENV') || ''
    ).toLowerCase();
    const nodeEnv = (
      this.configService.get<string>('NODE_ENV') || ''
    ).toLowerCase();
    this.isProduction = appEnv === 'production' || nodeEnv === 'production';

    this.fastApiBaseUrl = (
      this.configService.get<string>('FASTAPI_BASE_URL') ||
      'http://localhost:8000'
    ).replace(/\/+$/, '');
    this.internalApiKey =
      this.configService.get<string>('FASTAPI_INTERNAL_API_KEY') || '';
    this.aiJwtSecret =
      this.configService.get<string>('FASTAPI_JWT_SECRET') ||
      (this.isProduction
        ? (() => {
            throw new Error('FASTAPI_JWT_SECRET is required in production');
          })()
        : 'dev_secret');
    this.aiJwtAlgorithm =
      this.configService.get<string>('FASTAPI_JWT_ALGORITHM') || 'HS256';
    this.requestTimeoutMs = Number(
      this.configService.get<string>('FASTAPI_TIMEOUT_MS') || 30000,
    );
    this.allowDevBypass =
      (
        this.configService.get<string>('FASTAPI_ALLOW_DEV_BYPASS') || ''
      ).toLowerCase() === 'true';

    if (this.isProduction && !this.internalApiKey) {
      throw new Error(
        'FASTAPI_INTERNAL_API_KEY is required in production for service-to-service security.',
      );
    }

    if (
      this.isProduction &&
      (!this.aiJwtSecret || this.aiJwtSecret === 'dev_secret')
    ) {
      throw new Error(
        'FASTAPI_JWT_SECRET must be explicitly set in production ' +
          'Do not rely on JWT_SECRET fallback for AI bridge tokens',
      );
    }
  }

  async chatSync(
    authHeader: string | undefined,
    dto: AssistantChatDto,
    useDevBypass = false,
  ): Promise<JsonValue> {
    const headers = await this.createAuthHeaders(
      authHeader,
      dto.context,
      useDevBypass,
    );
    return this.requestJson('/chat', 'POST', headers, {
      message: dto.message,
      language: dto.language ?? null,
    });
  }

  async getStreamResponse(
    authHeader: string | undefined,
    dto: AssistantChatDto,
    useDevBypass = false,
    abortSignal?: AbortSignal,
  ) {
    const headers = await this.createAuthHeaders(
      authHeader,
      dto.context,
      useDevBypass,
    );

    const timeoutSignal = AbortSignal.timeout(this.requestTimeoutMs);
    const signal = abortSignal
      ? AbortSignal.any([abortSignal, timeoutSignal])
      : timeoutSignal;

    return safeFetch(`${this.fastApiBaseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: dto.message,
        language: dto.language ?? null,
      }),
      signal,
    });
  }

  async clearHistory(
    authHeader: string | undefined,
    context?: AssistantContextDto,
    useDevBypass = false,
  ): Promise<JsonValue> {
    const headers = await this.createAuthHeaders(
      authHeader,
      context,
      useDevBypass,
    );
    return this.requestJson('/chat/history', 'DELETE', headers);
  }

  async health(): Promise<JsonValue> {
    return this.requestJson('/health', 'GET');
  }

  async speak(
    authHeader: string | undefined,
    dto: AssistantSpeakDto,
    useDevBypass = false,
  ): Promise<BinaryResponse> {
    const headers = await this.createAuthHeaders(
      authHeader,
      dto.context,
      useDevBypass,
    );
    const response = await safeFetch(`${this.fastApiBaseUrl}/speak`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: dto.text }),
      signal: AbortSignal.timeout(this.requestTimeoutMs),
    });
    return this.handleBinaryResponse(response);
  }

  async transcribe(
    authHeader: string | undefined,
    file: UploadedAudioFile,
    dto: AssistantTranscribeDto,
    context?: AssistantContextDto,
    useDevBypass = false,
  ): Promise<JsonValue> {
    const headers = await this.createAuthHeaders(
      authHeader,
      context,
      useDevBypass,
    );
    const formData = new FormData();
    const audioBytes = new Uint8Array(
      file.buffer.buffer,
      file.buffer.byteOffset,
      file.buffer.byteLength,
    );
    const audioArrayBuffer = audioBytes.slice().buffer;
    formData.append(
      'audio',
      new Blob([audioArrayBuffer], { type: file.mimetype || 'audio/webm' }),
      file.originalname || 'audio.webm',
    );
    if (dto.language) {
      formData.append('language', dto.language);
    }

    const response = await safeFetch(`${this.fastApiBaseUrl}/transcribe`, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(this.requestTimeoutMs),
    });

    return this.handleJsonResponse(response);
  }

  private async requestJson(
    path: string,
    method: string,
    headers?: Record<string, string>,
    body?: unknown,
  ): Promise<JsonValue> {
    const response = await safeFetch(`${this.fastApiBaseUrl}${path}`, {
      method,
      headers: {
        ...(headers || {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.requestTimeoutMs),
    });

    return this.handleJsonResponse(response);
  }
  private async handleJsonResponse(response: Response): Promise<JsonValue> {
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? ((await response.json()) as JsonValue)
      : await response.text();

    if (!response.ok) {
      throw new BadGatewayException({
        status: response.status,
        upstream: body,
      });
    }
    return body;
  }

  private async handleBinaryResponse(
    response: Response,
  ): Promise<BinaryResponse> {
    if (!response.ok) {
      const fallback = await response.text();
      throw new BadGatewayException({
        status: response.status,
        upstream: fallback,
      });
    }
    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: new Uint8Array(arrayBuffer),
      contentType: response.headers.get('content-type') || 'audio/mpeg',
    };
  }

  private async createAuthHeaders(
    authHeader?: string,
    context?: AssistantContextDto,
    useDevBypass = false,
  ): Promise<Record<string, string>> {
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (useDevBypass && this.allowDevBypass && !this.isProduction) {
      return {
        'X-Dev-Bypass': 'true',
        ...(this.internalApiKey
          ? { 'X-Internal-Key': this.internalApiKey }
          : {}),
      };
    }

    if (!token) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    let payload: AppTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<AppTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'dev_secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    const username = payload.username || 'unknown-user';
    const role = this.toFastApiRole(payload.role);
    const aiPayload: AiTokenPayload = {
      sub: username,
      role,
      patient_id: context?.patientId || username,
      patient_name: context?.patientName || username,
      patient_age: context?.patientAge ?? 70,
      patient_stage: context?.patientStage ?? 1,
    };

    const aiToken = await this.jwtService.signAsync(aiPayload, {
      secret: this.aiJwtSecret,
      algorithm: this.aiJwtAlgorithm as never,
      expiresIn: '15m',
    });

    return {
      Authorization: `Bearer ${aiToken}`,
      ...(this.internalApiKey ? { 'X-Internal-Key': this.internalApiKey } : {}),
    };
  }

  private toFastApiRole(role?: string): FastApiRole {
    const normalized = (role || '').toLowerCase();
    if (normalized === 'admin') {
      return 'admin';
    }
    if (normalized === 'doctor') {
      return 'doctor';
    }
    return 'caregiver';
  }
}
