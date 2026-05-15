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

    const accountNumber = input.accountNumber ?? this.getPayoutAccountNumber() ?? this.getBeneficiaryAccount();
    const bankCode = input.bankCode ?? this.getPayoutBankCode();

    if (!accountNumber) {
      throw new BadRequestException("No payout account number is configured for Squad disbursement.");
    }

    if (!bankCode) {
      throw new BadRequestException("No payout bank code is configured for Squad disbursement.");
    }

    const lookedUpAccount = await this.lookupAccount(bankCode, accountNumber);
    const transactionReference = this.buildTransferReference(input.reference);

    try {
      const response = await firstValueFrom(this.httpService.post(
        `${this.getBaseUrl()}/payout/transfer`,
        {
          amount: Number(input.amountKobo),
          account_number: accountNumber,
          bank_code: bankCode,
          account_name: input.accountName ?? lookedUpAccount.accountName,
          transaction_reference: transactionReference,
          remark: input.narration,
          currency_id: "NGN"
        },
        {
          headers: this.getAuthHeaders(secretKey)
        }
      ));

      return {
        provider: "squad",
        payoutReference: response.data?.data?.transaction_reference ?? transactionReference,
        status: response.data?.data?.transaction_status ?? "queued",
        raw: response.data
      };
    } catch (error) {
      if (this.shouldUseDemoPayoutFallback(error)) {
        this.logger.warn("Falling back to demo payout because this Squad merchant is not eligible for live transfers in the current environment.");
        return {
          provider: "demo",
          payoutReference: `SQD-PAYOUT-${transactionReference}`,
          status: "queued"
        };
      }

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
    return this.configService.get<string>("APP_BASE_URL") ?? "https://dub.heralayer.com";
  }

  private getRedirectUrl() {
    return this.configService.get<string>("SQUAD_REDIRECT_URL") ?? `${this.getAppBaseUrl()}/api/v1/payments/callback`;
  }

  private getBeneficiaryAccount() {
    return this.configService.get<string>("SQUAD_BENEFICIARY_ACCOUNT");
  }

  private getPayoutAccountNumber() {
    return this.configService.get<string>("SQUAD_PAYOUT_ACCOUNT_NUMBER");
  }

  private getPayoutBankCode() {
    return this.configService.get<string>("SQUAD_PAYOUT_BANK_CODE") ?? "000013";
  }

  private getMerchantId() {
    return this.configService.get<string>("SQUAD_MERCHANT_ID");
  }

  private getSquadPhoneNumber(phoneNumber: string) {
    return phoneNumber.replace(/\D/g, "");
  }

  private async lookupAccount(bankCode: string, accountNumber: string) {
    const secretKey = this.configService.get<string>("SQUAD_SECRET_KEY");

    if (!secretKey || secretKey === "replace-me") {
      return {
        accountName: "TRACE DEMO USER",
        accountNumber
      };
    }

    try {
      const response = await firstValueFrom(this.httpService.post(
        `${this.getBaseUrl()}/payout/account/lookup`,
        {
          bank_code: bankCode,
          account_number: accountNumber
        },
        {
          headers: this.getAuthHeaders(secretKey)
        }
      ));

      return {
        accountName: response.data?.data?.account_name,
        accountNumber: response.data?.data?.account_number ?? accountNumber
      };
    } catch (error) {
      if (this.shouldUseDemoPayoutFallback(error)) {
        this.logger.warn("Skipping live Squad account lookup because this merchant is not eligible for the payout endpoint in the current environment.");
        return {
          accountName: "TRACE DEMO USER",
          accountNumber
        };
      }

      this.mapAndThrowProviderError(error, "Squad payout account lookup");
    }
  }

  private buildTransferReference(reference: string) {
    const merchantId = this.getMerchantId();

    if (!merchantId) {
      return reference;
    }

    return reference.startsWith(`${merchantId}_`) ? reference : `${merchantId}_${reference}`;
  }

  private shouldUseDemoPayoutFallback(error: unknown) {
    if (!isAxiosError(error)) {
      return false;
    }

    const message =
      error.response?.data?.message ??
      error.response?.data?.data?.message ??
      error.message;

    return typeof message === "string" && (
      message.includes("Merchant not eligible to use this endpoint") ||
      message.includes("Merchant not profiled for this service")
    );
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
