export type NotificationProviderName = "logger" | "resend";

export type EmailNotificationProvider = {
  send(input: { to: string; subject: string; text: string }): Promise<void>;
};
