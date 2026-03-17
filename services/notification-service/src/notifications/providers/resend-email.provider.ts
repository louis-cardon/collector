import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { EmailNotificationProvider } from "../notifications.types";

@Injectable()
export class ResendEmailProvider implements EmailNotificationProvider {
  constructor(private readonly configService: ConfigService) {}

  async send(input: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");

    if (!apiKey) {
      return;
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from:
        this.configService.get<string>("NOTIFICATIONS_FROM_EMAIL") ??
        "no-reply@collector.local",
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
  }
}
