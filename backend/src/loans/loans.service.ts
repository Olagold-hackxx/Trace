import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoanApplication } from "../entities/loan-application.entity";
import { LoanOffer } from "../entities/loan-offer.entity";
import { Loan } from "../entities/loan.entity";
import { RealtimeService } from "../realtime/realtime.service";
import { SquadService } from "../squad/squad.service";
import { UsersService } from "../users/users.service";
import { CreateLoanApplicationDto } from "./dto/create-loan-application.dto";

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly applicationsRepository: Repository<LoanApplication>,
    @InjectRepository(LoanOffer)
    private readonly offersRepository: Repository<LoanOffer>,
    @InjectRepository(Loan)
    private readonly loansRepository: Repository<Loan>,
    private readonly usersService: UsersService,
    private readonly realtimeService: RealtimeService,
    private readonly squadService: SquadService
  ) {}

  async getSummary(sessionToken?: string) {
    const applications = await this.getApplications(sessionToken);
    const offers = await this.getOffers(sessionToken);
    const active = await this.getActiveLoan(sessionToken);

    return {
      applicationsCount: applications.length,
      offersCount: offers.length,
      activeLoan: active
    };
  }

  async getOffers(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    const offers = await this.offersRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" }
    });

    if (offers.length > 0) {
      return offers;
    }

    return Promise.all([
      this.offersRepository.save({
        userId: user.id,
        lenderName: "Zenith Capital",
        amountKobo: "250000000",
        rateLabel: "18% p.a.",
        tenorLabel: "12 months",
        monthlyRepaymentLabel: "₦137,500"
      }),
      this.offersRepository.save({
        userId: user.id,
        lenderName: "GTFund Microfinance",
        amountKobo: "180000000",
        rateLabel: "16% p.a.",
        tenorLabel: "9 months",
        monthlyRepaymentLabel: "₦112,000"
      })
    ]);
  }

  async createApplication(sessionToken: string | undefined, dto: CreateLoanApplicationDto) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.applicationsRepository.save({
      userId: user.id,
      ...dto,
      status: "under_review"
    });
  }

  async getApplications(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.applicationsRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" }
    });
  }

  async acceptOffer(offerId: string) {
    const offer = await this.offersRepository.findOne({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundException("Loan offer not found");
    }

    offer.status = "accepted";
    await this.offersRepository.save(offer);

    const payout = await this.squadService.createPayout({
      amountKobo: offer.amountKobo,
      reference: `loan-${offer.id}-${Date.now()}`,
      narration: `${offer.lenderName} business facility disbursement`
    });

    const loan = await this.loansRepository.save({
      userId: offer.userId,
      offerId: offer.id,
      lenderName: offer.lenderName,
      principalKobo: offer.amountKobo,
      amountRepaidKobo: "0",
      rateLabel: offer.rateLabel,
      tenorLabel: offer.tenorLabel,
      repaymentMethod: "cash_flow_indexed",
      repaymentPctLabel: "5%",
      status: "active",
      nextDueDate: "2026-06-12",
      squadPayoutRef: payout.payoutReference
    });

    await this.realtimeService.publishToUser(offer.userId, "loan.disbursed", {
      loanId: loan.id,
      amountKobo: loan.principalKobo,
      lenderName: loan.lenderName
    });

    return loan;
  }

  async getActiveLoan(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.loansRepository.findOne({
      where: { userId: user.id, status: "active" },
      order: { createdAt: "DESC" }
    });
  }

  async getLoanById(loanId: string) {
    const loan = await this.loansRepository.findOne({ where: { id: loanId } });
    if (!loan) {
      throw new NotFoundException("Loan not found");
    }

    return loan;
  }

  async getRepayments(loanId: string) {
    const loan = await this.getLoanById(loanId);
    return [
      { date: loan.createdAt, amountKobo: 0, status: "disbursed" },
      { date: loan.nextDueDate, amountKobo: 2500000, status: "scheduled" }
    ];
  }

  async makeManualRepayment(loanId: string) {
    const loan = await this.getLoanById(loanId);
    const nextAmount = Number(loan.amountRepaidKobo) + 2500000;
    loan.amountRepaidKobo = String(nextAmount);
    await this.loansRepository.save(loan);
    return loan;
  }
}
