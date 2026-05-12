import { Body, Controller, Headers, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { WebhooksService } from "./webhooks.service";

@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("squad")
  receiveSquadWebhook(
    @Req() request: Request,
    @Headers("x-squad-signature") signature: string | undefined,
    @Body() payload: Record<string, unknown>
  ) {
    const requestWithRawBody = request as Request & { rawBody?: Buffer };
    return this.webhooksService.handleSquadWebhook({
      signature,
      payload,
      rawBody: requestWithRawBody.rawBody
    });
  }
}
