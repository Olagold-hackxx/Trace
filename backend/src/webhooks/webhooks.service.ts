import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction } from "../entities/transaction.entity";
import { RealtimeService } from "../realtime/realtime.service";
import { SquadService } from "../squad/squad.service";

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly realtimeService: RealtimeService,
    private readonly squadService: SquadService
  ) {}

  async handleSquadWebhook(input: {
    signature?: string;
    payload: Record<string, unknown>;
    rawBody?: Buffer;
  }) {
    if (input.rawBody && !this.squadService.verifyWebhookSignature(input.rawBody, input.signature)) {
      return {
        received: false,
        reason: "invalid_signature"
      };
    }

    const userId = String(input.payload.userId ?? "demo-user");
    const reference = String(input.payload.reference ?? `SQD-${Date.now()}`);
    const amountKobo = String(input.payload.amountKobo ?? 0);

    const existing = await this.transactionsRepository.findOne({ where: { reference } });
    if (!existing) {
      await this.transactionsRepository.save({
        userId,
        reference,
        type: String(input.payload.type ?? "credit"),
        amountKobo,
        senderName: String(input.payload.senderName ?? "Squad Sandbox"),
        status: "success",
        rawPayload: input.payload
      });
    }

    await this.realtimeService.publishToUser(userId, "transaction.created", {
      reference,
      amountKobo
    });

    return {
      received: true,
      signaturePresent: Boolean(input.signature)
    };
  }
}
