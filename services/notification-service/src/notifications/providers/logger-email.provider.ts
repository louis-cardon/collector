import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import type { EmailNotificationProvider } from "../notifications.types";

@Injectable()
export class LoggerEmailProvider implements EmailNotificationProvider {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LoggerEmailProvider.name);
  }

  send(input: { to: string; subject: string; text: string }): Promise<void> {
    this.logger.info(
      {
        event: "notification.email.logged",
        to: input.to,
        subject: input.subject,
      },
      input.text,
    );

    return Promise.resolve();
  }
}
