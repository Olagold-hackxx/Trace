import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { PaymentLink } from "../entities/payment-link.entity";
import { Transaction } from "../entities/transaction.entity";
import { RealtimeService } from "../realtime/realtime.service";
import { SquadService } from "../squad/squad.service";
import { UsersService } from "../users/users.service";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentLink)
    private readonly paymentLinksRepository: Repository<PaymentLink>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
    private readonly realtimeService: RealtimeService,
    private readonly squadService: SquadService,
    private readonly configService: ConfigService
  ) {}

  private buildPaymentLinkUrl(slug: string) {
    const frontendBase = this.configService.get<string>("FRONTEND_URL") ?? "https://trace-nu-dusky.vercel.app";
    return `${frontendBase}/pay/${slug}`;
  }

  private withUrl(link: PaymentLink) {
    return { ...link, url: this.buildPaymentLinkUrl(link.slug) };
  }

  async getLinks(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    const links = await this.paymentLinksRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" }
    });
    return links.map((link) => this.withUrl(link));
  }

  async getDefaultLink(sessionToken?: string) {
    const links = await this.getLinks(sessionToken);
    return links[0] ?? this.createLink(sessionToken, { name: "Amaka Foods - General", amountKobo: "0" });
  }

  async createLink(sessionToken: string | undefined, dto: CreatePaymentLinkDto) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    const slug = `${user.businessName?.toLowerCase().replace(/\s+/g, "-") ?? "trace"}-${Date.now()}`;
    const link = await this.paymentLinksRepository.save({
      userId: user.id,
      name: dto.name,
      slug,
      amountKobo: dto.amountKobo,
      description: dto.description,
      active: dto.active ?? true
    });
    return this.withUrl(link);
  }

  async updateLink(id: string, dto: Partial<CreatePaymentLinkDto>) {
    const link = await this.paymentLinksRepository.findOne({ where: { id } });
    if (!link) {
      throw new NotFoundException("Payment link not found");
    }

    Object.assign(link, dto);
    return this.paymentLinksRepository.save(link);
  }

  async initiatePayment(sessionToken: string | undefined, dto: InitiatePaymentDto) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    const reference = `PAY-${Date.now()}`;

    const transaction = await this.transactionsRepository.save({
      userId: user.id,
      reference,
      type: "payment_link",
      amountKobo: dto.amountKobo,
      senderName: dto.email ?? "customer@demo.local",
      status: "pending",
      rawPayload: {
        provider: "squad",
        description: dto.description
      }
    });

    const squadResponse = await this.squadService.initiatePayment({
      amountKobo: dto.amountKobo,
      email: dto.email,
      transactionRef: reference,
      description: dto.description
    });

    await this.realtimeService.publishToUser(user.id, "transaction.created", {
      reference,
      status: "pending",
      amountKobo: dto.amountKobo
    });

    return {
      reference,
      checkoutUrl: squadResponse.checkoutUrl,
      transaction
    };
  }

  async verifyPayment(reference: string) {
    const transaction = await this.transactionsRepository.findOne({ where: { reference } });
    if (!transaction) {
      throw new NotFoundException("Payment transaction not found");
    }

    const verification = await this.squadService.verifyPayment(reference);
    transaction.status = verification.verified ? "success" : "failed";
    await this.transactionsRepository.save(transaction);

    return {
      verified: verification.verified,
      transaction
    };
  }

  handleCallback(transactionRef?: string, status?: string) {
    return {
      success: true,
      transactionRef: transactionRef ?? null,
      status: status ?? "unknown"
    };
  }
}
