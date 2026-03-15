import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Resend } from 'resend';
import { ResendEmailProvider } from './resend-email.provider';

jest.mock('resend', () => ({
  Resend: jest.fn(),
}));

describe('ResendEmailProvider', () => {
  let provider: ResendEmailProvider;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;
  let logger: jest.Mocked<Pick<PinoLogger, 'error' | 'info' | 'setContext'>>;
  let sendMock: jest.Mock;

  beforeEach(() => {
    sendMock = jest.fn();
    (Resend as jest.Mock).mockImplementation(() => ({
      emails: {
        send: sendMock,
      },
    }));

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'RESEND_API_KEY') {
          return 're_test_key';
        }

        if (key === 'NOTIFICATIONS_FROM_EMAIL') {
          return 'noreply@test.collector.shop';
        }

        return undefined;
      }),
    };
    logger = {
      setContext: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
    provider = new ResendEmailProvider(
      configService as unknown as ConfigService,
      logger as unknown as PinoLogger,
    );
  });

  it('sends email with Resend client', async () => {
    sendMock.mockResolvedValue({
      data: {
        id: 'email-id',
      },
      error: null,
    });

    await provider.send({
      to: 'seller@collector.local',
      subject: 'Annonce approuvee',
      text: 'Votre annonce a ete approuvee.',
    });

    expect(Resend).toHaveBeenCalledWith('re_test_key');
    expect(sendMock).toHaveBeenCalledWith({
      from: 'noreply@test.collector.shop',
      to: 'seller@collector.local',
      subject: 'Annonce approuvee',
      text: 'Votre annonce a ete approuvee.',
    });
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'notification.email.resend.sent',
        emailId: 'email-id',
      }),
      'Resend email sent',
    );
  });

  it('throws when Resend is not configured', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'RESEND_API_KEY') {
        return undefined;
      }

      return 'noreply@test.collector.shop';
    });

    await expect(
      provider.send({
        to: 'seller@collector.local',
        subject: 'Annonce approuvee',
        text: 'Votre annonce a ete approuvee.',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('throws when Resend returns an API error', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: {
        message: 'Provider rejected request',
      },
    });

    await expect(
      provider.send({
        to: 'seller@collector.local',
        subject: 'Annonce approuvee',
        text: 'Votre annonce a ete approuvee.',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'notification.email.resend.failed',
        to: 'seller@collector.local',
      }),
      'Resend email delivery failed',
    );
  });
});
