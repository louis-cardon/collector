export type NotificationEmail = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailNotificationProvider {
  send(email: NotificationEmail): Promise<void>;
}

export type NotificationProviderName = 'logger' | 'resend';
