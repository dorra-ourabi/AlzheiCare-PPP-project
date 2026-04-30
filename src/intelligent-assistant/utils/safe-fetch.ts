import { BadGatewayException } from '@nestjs/common';

export async function safeFetch(
  url: string,
  options: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (
      (err instanceof DOMException && err.name === 'TimeoutError') ||
      message.includes('The operation was aborted') ||
      message.includes('signal timed out')
    ) {
      throw new BadGatewayException(
        'AI service timeout — the upstream did not respond in time',
      );
    }

    throw new BadGatewayException(`AI service unreachable — ${message}`);
  }
}
