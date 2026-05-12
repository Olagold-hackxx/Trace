import { HttpService } from "@nestjs/axios";
import { BadGatewayException, BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";
import { isAxiosError } from "axios";
import { firstValueFrom } from "rxjs";

interface ProvisionVirtualAccountInput {
  customerIdentifier: string;
  businessName: string;
  phoneNumber: string;
  bvn: string;
  beneficiaryAccount?: string;
  email?: string;
}

interface InitiatePaymentInput {
  amountKobo: string;
  email?: string;
  transactionRef: string;
  description: string;
}

interface PayoutInput {
  amountKobo: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  reference: string;
  narration: string;
}

@Injectable()
export class SquadService {
  private readonly logger = new Logger(SquadService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async provisionBusinessVirtualAccount(input: ProvisionVirtualAccountInput) {
    const secretKey = this.configService.get<string>("SQUAD_SECRET_KEY");

    if (!secretKey || secretKey === "replace-me") {
      return {
        provider: "demo",
        accountNumber: "8052341127",
        bankName: "GTBank",
        customerId: `SQD-DEMO-${input.customerIdentifier}`
      };
    }

    try {
      const response = await firstValueFrom(this.httpService.post(
        `${this.getBaseUrl()}/virtual-account/business`,
        {
          customer_identifier: input.customerIdentifier,
          business_name: input.businessName,
          mobile_num: this.getSquadPhoneNumber(input.phoneNumber),
          bvn: input.bvn,
          beneficiary_account: input.beneficiaryAccount ?? this.getBeneficiaryAccount(),
          email: input.email
        },
        {
          headers: this.getAuthHeaders(secretKey)
        }
      ));

      return {
        provider: "squad",
        accountNumber: response.data?.data?.virtual_account_number ?? response.data?.data?.account_number,
        bankName: response.data?.data?.bank_name ?? response.data?.data?.bank ?? "GTBank",
        customerId: response.data?.data?.customer_identifier ?? input.customerIdentifier,
        raw: response.data
      };
    } catch (error) {
      this.mapAndThrowProviderError(error, "Squad business virtual account provisioning");
    }
  }

  async initiatePayment(input: InitiatePaymentInput) {
    const secretKey = this.configService.get<string>("SQUAD_SECRET_KEY");

    if (!secretKey || secretKey === "replace-me") {
      return {
        provider: "demo",
        checkoutUrl: `https://pay.trace.ng/checkout/${input.transactionRef}`,
        transactionRef: input.transactionRef
      };
    }

    try {
      const response = await firstValueFrom(this.httpService.post(
        `${this.getBaseUrl()}/transaction/initiate`,
        {
          amount: Number(input.amountKobo),
          email: input.email,
          initiate_type: "inline",
          transaction_ref: input.transactionRef,
          currency: "NGN",
          callback_url: this.getRedirectUrl(),
          metadata: {
            description: input.description
          }
        },
        {
          headers: this.getAuthHeaders(secretKey)
        }
      ));

      return {
        provider: "squad",
        checkoutUrl: response.data?.data?.checkout_url,
        transactionRef: input.transactionRef,
        raw: response.data
      };
    } catch (error) {
      this.mapAndThrowProviderError(error, "Squad payment initiation");
    }
  }

  async verifyPayment(reference: string) {
    const secretKey = this.configService.get<string>("SQUAD_SECRET_KEY");

    if (!secretKey || secretKey === "replace-me") {
      return {
        provider: "demo",
        verified: true,
        transactionRef: reference
      };
    }

    try {
      const response = await firstValueFrom(this.httpService.get(
        `${this.getBaseUrl()}/transaction/verify/${reference}`,
        {
          headers: this.getAuthHeaders(secretKey)
        }
      ));

      return {
        provider: "squad",
        verified: response.data?.success ?? true,
        raw: response.data
      };
    } catch (error) {
      this.mapAndThrowProviderError(error, "Squad payment verification");
    }
  }

  async createPayout(input: PayoutInput) {
    const secretKey = this.configService.get<string>("SQUAD_SECRET_KEY");

    if (!secretKey || secretKey === "replace-me") {
      return {
        provider: "demo",
        payoutReference: `SQD-PAYOUT-${input.reference}`,
        status: "queued"
      };
    }

    try {
      const response = await firstValueFrom(this.httpService.post(
        `${this.getBaseUrl()}/payout/transfer`,
        {
          amount: Number(input.amountKobo),
          account_number: input.accountNumber,
          bank_code: input.bankCode,
          account_name: input.accountName,
          transaction_reference: input.reference,
          narration: input.narration,
          currency_id: "NGN"
        },
        {
          headers: this.getAuthHeaders(secretKey)
        }
      ));

      return {
        provider: "squad",
        payoutReference: response.data?.data?.transaction_reference ?? input.reference,
        status: response.data?.data?.transaction_status ?? "queued",
        raw: response.data
      };
    } catch (error) {
      this.mapAndThrowProviderError(error, "Squad payout transfer");
    }
  }

  verifyWebhookSignature(rawBody: Buffer, signature?: string): boolean {
    const webhookSecret = this.configService.get<string>("SQUAD_WEBHOOK_SECRET");

    if (!webhookSecret || webhookSecret === "replace-me") {
      this.logger.warn("Skipping Squad webhook signature verification because no webhook secret is configured.");
      return true;
    }

    if (!signature) {
      return false;
    }

    const digest = createHmac("sha512", webhookSecret).update(rawBody).digest("hex");
    return digest === signature;
  }

  private getAuthHeaders(secretKey: string) {
    return {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json"
    };
  }

  private getBaseUrl() {
    return this.configService.get<string>("SQUAD_BASE_URL") ?? "https://sandbox-api-d.squadco.com";
  }

  private getAppBaseUrl() {
    return this.configService.get<string>("APP_BASE_URL") ?? "http://localhost:3001";
  }

  private getRedirectUrl() {
    return this.configService.get<string>("SQUAD_REDIRECT_URL") ?? `${this.getAppBaseUrl()}/api/v1/payments/callback`;
  }

  private getBeneficiaryAccount() {
    return this.configService.get<string>("SQUAD_BENEFICIARY_ACCOUNT");
  }

  private getSquadPhoneNumber(phoneNumber: string) {
    return phoneNumber.replace(/\D/g, "");
  }

  private mapAndThrowProviderError(error: unknown, operation: string): never {
    if (!isAxiosError(error)) {
      throw error;
    }

    const status = error.response?.status ?? 502;
    const payload = error.response?.data;
    const providerMessage =
      payload?.message ??
      payload?.data?.message ??
      payload?.errors?.[0]?.message ??
      error.message;

    this.logger.error(`${operation} failed`, JSON.stringify({
      status,
      message: providerMessage,
      payload
    }));

    if (status === 400) {
      throw new BadRequestException(providerMessage);
    }

    if (status === 401) {
      throw new UnauthorizedException(providerMessage);
    }

    if (status === 403) {
      throw new ForbiddenException(providerMessage);
    }

    throw new BadGatewayException(providerMessage);
  }
}
