import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthClientService {
  constructor(private readonly configService: ConfigService) {}

  async findUserById(id: string): Promise<{ id: string; email: string; role: string }> {
    const baseUrl = this.configService.get<string>('AUTH_SERVICE_URL');

    if (!baseUrl) {
      throw new NotFoundException('Auth service URL not configured');
    }

    const response = await fetch(`${baseUrl}/internal/users/${id}`, {
      headers: {
        Accept: 'application/json',
        'x-internal-token':
          this.configService.get<string>('INTERNAL_SERVICE_TOKEN') ??
          'internal-change-me',
      },
    });

    if (!response.ok) {
      throw new NotFoundException('Notification recipient not found');
    }

    return (await response.json()) as { id: string; email: string; role: string };
  }
}
