import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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
    private readonly squadService: SquadService
  ) {}

  async getLinks() {
    const user = await this.usersService.getCurrentUser();
    return this.paymentLinksRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" }
    });
  }

  async getDefaultLink() {
    const links = await this.getLinks();
    return links[0] ?? this.createLink({ name: "Amaka Foods - General", amountKobo: "0" });
  }

  async createLink(dto: CreatePaymentLinkDto) {
    const user = await this.usersService.getCurrentUser();
    const slug = `${user.businessName?.toLowerCase().replace(/\s+/g, "-") ?? "trace"}-${Date.now()}`;
    return this.paymentLinksRepository.save({
      userId: user.id,
      name: dto.name,
      slug,
      amountKobo: dto.amountKobo,
      description: dto.description,
      active: dto.active ?? true
    });
  }

  async updateLink(id: string, dto: Partial<CreatePaymentLinkDto>) {
    const link = await this.paymentLinksRepository.findOne({ where: { id } });
    if (!link) {
      throw new NotFoundException("Payment link not found");
    }

    Object.assign(link, dto);
    return this.paymentLinksRepository.save(link);
  }

  async initiatePayment(dto: InitiatePaymentDto) {
    const user = await this.usersService.getCurrentUser();
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
