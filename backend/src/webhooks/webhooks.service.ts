import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction } from "../entities/transaction.entity";
import { FraudAlert } from "../entities/fraud-alert.entity";
import { RealtimeService } from "../realtime/realtime.service";
import { SquadService } from "../squad/squad.service";
import { LenderService } from "../lender/lender.service";
import { LenderWallet } from "../entities/lender-wallet.entity";
import { MlClientService } from "../ml/ml-client.service";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(LenderWallet)
    private readonly lenderWalletsRepository: Repository<LenderWallet>,
    @InjectRepository(FraudAlert)
    private readonly fraudAlertsRepository: Repository<FraudAlert>,
    private readonly realtimeService: RealtimeService,
    private readonly squadService: SquadService,
    private readonly lenderService: LenderService,
    private readonly mlClient: MlClientService
  ) {}

  async handleSquadWebhook(input: {
    signature?: string;
    payload: Record<string, unknown>;
    rawBody?: Buffer;
  }) {
    if (input.rawBody && !this.squadService.verifyWebhookSignature(input.rawBody, input.signature)) {
      throw new UnauthorizedException("Invalid webhook signature.");
    }

    const parsed = this.parseSquadTransactionPayload(input.payload);

    // If customer_identifier starts with "lender-", this is a lender wallet deposit
    const isLenderDeposit = parsed.userId.startsWith("lender-");
    const realUserId = isLenderDeposit ? parsed.userId.replace(/^lender-/, "") : parsed.userId;

    const existing = await this.transactionsRepository.findOne({ where: { reference: parsed.reference } });
    if (!existing) {
      const saved = await this.transactionsRepository.save({
        userId: realUserId,
        reference: parsed.reference,
        type: isLenderDeposit ? "lender_deposit" : parsed.type,
        amountKobo: parsed.amountKobo,
        senderName: parsed.senderName,
        senderAccount: parsed.maskedSenderAccountNumber,
        maskedSenderAccountNumber: parsed.maskedSenderAccountNumber,
        sessionId: parsed.sessionId,
        remarks: parsed.remarks,
        channel: parsed.channel,
        transactionIndicator: parsed.transactionIndicator,
        virtualAccountNumber: parsed.virtualAccountNumber,
        settledAmountKobo: parsed.settledAmountKobo,
        principalAmountKobo: parsed.principalAmountKobo,
        status: "success",
        occurredAt: parsed.occurredAt,
        rawPayload: input.payload
      });

      // Credit the lender's wallet on deposit
      if (isLenderDeposit && parsed.transactionIndicator !== "D") {
        await this.lenderService.creditWallet(realUserId, parsed.amountKobo);
      }

      // Fraud check — fire-and-forget for inflows only, never block the response
      if (!isLenderDeposit && parsed.transactionIndicator !== "D") {
        this.runFraudCheck(saved.id, realUserId, parsed).catch((err) =>
          this.logger.error(`Fraud check failed for txn ${saved.id}: ${(err as Error)?.message}`)
        );
      }
    }

    await this.realtimeService.publishToUser(realUserId, "transaction.created", {
      reference: parsed.reference,
      amountKobo: parsed.amountKobo,
      senderName: parsed.senderName,
      maskedSenderAccountNumber: parsed.maskedSenderAccountNumber,
      channel: parsed.channel,
      transactionIndicator: parsed.transactionIndicator
    });

    return {
      received: true,
      signaturePresent: Boolean(input.signature),
      webhookType: parsed.webhookType,
      reference: parsed.reference
    };
  }

  private async runFraudCheck(
    transactionId: string,
    userId: string,
    parsed: { amountKobo: string; senderName: string; occurredAt?: Date }
  ) {
    const result = await this.mlClient.predictFraud({
      transaction_id: transactionId,
      user_id: userId,
      occurred_at: (parsed.occurredAt ?? new Date()).toISOString(),
      amount_kobo: Number(parsed.amountKobo),
      sender_name: parsed.senderName ?? "Unknown",
      type: "inflow",
    });

    const severity =
      result.anomaly_score >= 0.75 ? "high" :
      result.anomaly_score >= 0.50 ? "medium" : "low";

    await this.fraudAlertsRepository.save({
      transactionId,
      userId,
      anomalyScore: result.anomaly_score,
      isAnomalous: result.is_anomalous,
      topSignals: result.top_signals,
      fraudPenalty: result.fraud_penalty,
      severity,
      status: "open",
    });

    if (result.is_anomalous) {
      await this.realtimeService.publishToUser(userId, "fraud.alert", {
        transactionId,
        anomalyScore: result.anomaly_score,
        severity,
        topSignals: result.top_signals,
        message: `Anomalous transaction detected — ${result.top_signals.slice(0, 2).join(", ")}.`,
      });
    }
  }

  private parseSquadTransactionPayload(payload: Record<string, unknown>) {
    const body = this.extractPayloadBody(payload);
    const reference =
      this.pickString(body, ["transaction_reference", "transactionReference"]) ??
      this.pickString(body, ["transaction_uuid", "transactionUuid"]) ??
      this.pickString(payload, ["reference"]) ??
      `SQD-${Date.now()}`;
    const userId =
      this.pickString(body, ["customer_identifier", "customerIdentifier"]) ??
      this.pickString(payload, ["userId"]) ??
      "demo-user";
    const principalAmountKobo =
      this.pickAmount(body, ["principal_amount", "principalAmount"]) ??
      this.pickAmount(payload, ["amountKobo"]);
    const settledAmountKobo = this.pickAmount(body, ["settled_amount", "settledAmount"]);
    const amountKobo = principalAmountKobo ?? settledAmountKobo ?? "0";
    const transactionIndicator =
      this.pickString(body, ["transaction_indicator", "transactionIndicator"]) ??
      this.pickString(payload, ["type"]) ??
      "C";
    const senderName =
      this.pickString(body, ["sender_name", "senderName"]) ??
      this.pickString(payload, ["senderName"]) ??
      "Squad Sandbox";
    const maskedSenderAccountNumber =
      this.pickString(body, ["masked_sender_account_number", "maskedSenderAccountNumber"]) ??
      this.pickString(payload, ["maskedSenderAccountNumber"]);
    const occurredAtRaw =
      this.pickString(body, ["transaction_date", "transactionDate"]) ??
      this.pickString(payload, ["occurredAt"]);

    return {
      webhookType: this.isVirtualAccountPayload(body) ? "virtual_account" : "generic",
      userId,
      reference,
      type: transactionIndicator === "D" ? "debit" : "credit",
      amountKobo,
      senderName,
      maskedSenderAccountNumber,
      sessionId:
        this.pickString(body, ["session_id", "sessionId"]) ??
        this.pickString(payload, ["sessionId"]),
      remarks:
        this.pickString(body, ["remarks"]) ??
        this.pickString(payload, ["remarks"]),
      channel:
        this.pickString(body, ["channel"]) ??
        this.pickString(payload, ["channel"]),
      transactionIndicator,
      virtualAccountNumber:
        this.pickString(body, ["virtual_account_number", "virtualAccountNumber"]) ??
        this.pickString(payload, ["virtualAccountNumber"]),
      settledAmountKobo,
      principalAmountKobo,
      occurredAt: occurredAtRaw ? new Date(occurredAtRaw) : undefined
    };
  }

  private extractPayloadBody(payload: Record<string, unknown>) {
    const candidates = [
      payload.Body,
      payload.body,
      payload.data,
      payload.Data
    ];

    for (const candidate of candidates) {
      if (this.isRecord(candidate)) {
        return candidate;
      }
    }

    return payload;
  }

  private isVirtualAccountPayload(payload: Record<string, unknown>) {
    return Boolean(
      this.pickString(payload, ["virtual_account_number", "virtualAccountNumber"]) ||
      this.pickString(payload, ["customer_identifier", "customerIdentifier"]) ||
      this.pickString(payload, ["masked_sender_account_number", "maskedSenderAccountNumber"])
    );
  }

  private pickString(source: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }

      if (typeof value === "number") {
        return String(value);
      }
    }

    return undefined;
  }

  private pickAmount(source: Record<string, unknown>, keys: string[]) {
    const value = this.pickString(source, keys);
    if (!value) {
      return undefined;
    }

    const normalized = value.replace(/[^\d.-]/g, "");
    return normalized.length > 0 ? normalized : undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
