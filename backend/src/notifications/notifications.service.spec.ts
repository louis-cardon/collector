import { NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { UsersService } from '../users/users.service';
import { NotificationsService } from './notifications.service';
import { EmailNotificationProvider } from './notifications.types';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let usersService: jest.Mocked<Pick<UsersService, 'findById'>>;
  let provider: jest.Mocked<EmailNotificationProvider>;
  let logger: jest.Mocked<Pick<PinoLogger, 'setContext' | 'info' | 'warn'>>;
  let sendMock: jest.Mock;

  beforeEach(() => {
    usersService = {
      findById: jest.fn(),
    };
    sendMock = jest.fn().mockResolvedValue(undefined);
    provider = {
      send: sendMock,
    };
    logger = {
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };
    service = new NotificationsService(
      usersService as unknown as UsersService,
      logger as unknown as PinoLogger,
      provider,
    );
  });

  it('sends approval notification to article seller', async () => {
    usersService.findById.mockResolvedValue({
      id: 'seller-id',
      email: 'seller@collector.local',
    } as never);

    await service.sendArticleApprovedNotification({
      id: 'article-id',
      title: 'Carte rare',
      sellerId: 'seller-id',
    });

    expect(sendMock).toHaveBeenCalledWith({
      to: 'seller@collector.local',
      subject: 'Annonce approuvee: Carte rare',
      text: 'Votre annonce "Carte rare" (article-id) a ete approuvee.',
    });
  });

  it('throws when notification recipient is missing', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(
      service.sendArticleRejectedNotification({
        id: 'article-id',
        title: 'Carte rare',
        sellerId: 'missing-seller',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
