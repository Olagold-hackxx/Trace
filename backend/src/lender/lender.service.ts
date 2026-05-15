import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SessionService } from "../session/session.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "../entities/job.entity";
import { LenderWallet } from "../entities/lender-wallet.entity";
import { LoanApplication } from "../entities/loan-application.entity";
import { Loan } from "../entities/loan.entity";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { Transaction } from "../entities/transaction.entity";
import { User } from "../entities/user.entity";
import { SquadService } from "../squad/squad.service";
import { LoanDecisionDto } from "./dto/loan-decision.dto";

@Injectable()
export class LenderService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(LoanApplication)
    private readonly applicationsRepository: Repository<LoanApplication>,
    @InjectRepository(Loan)
    private readonly loansRepository: Repository<Loan>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(ScoreSnapshot)
    private readonly scoresRepository: Repository<ScoreSnapshot>,
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(LenderWallet)
    private readonly walletsRepository: Repository<LenderWallet>,
    private readonly sessionService: SessionService,
    private readonly squadService: SquadService
  ) {}

  // ─── Wallet ────────────────────────────────────────────────────────────────

  async getWallet(sessionToken?: string) {
    const user = await this.getSessionUser(sessionToken);
    return this.getOrCreateWallet(user);
  }

  async provisionWalletAccount(sessionToken?: string) {
    const user = await this.getSessionUser(sessionToken);
    const wallet = await this.getOrCreateWallet(user);

    if (wallet.virtualAccountNumber) {
      return wallet;
    }

    const result = await this.squadService.provisionBusinessVirtualAccount({
      customerIdentifier: `lender-${user.id}`,
      businessName: user.businessName ?? user.fullName,
      phoneNumber: user.phone,
      bvn: user.bvn ?? "00000000000",
      email: user.email
    });

    wallet.virtualAccountNumber = result.accountNumber;
    wallet.bankName = result.bankName;
    wallet.squadCustomerId = result.customerId;
    return this.walletsRepository.save(wallet);
  }

  async creditWallet(userId: string, amountKobo: string) {
    const wallet = await this.walletsRepository.findOne({ where: { userId } });
    if (!wallet) return;
    wallet.availableKobo = String(Number(wallet.availableKobo) + Number(amountKobo));
    wallet.totalDepositedKobo = String(Number(wallet.totalDepositedKobo) + Number(amountKobo));
    await this.walletsRepository.save(wallet);
  }

  async creditWalletRepayment(userId: string, amountKobo: string) {
    const wallet = await this.walletsRepository.findOne({ where: { userId } });
    if (!wallet) return;
    wallet.availableKobo = String(Number(wallet.availableKobo) + Number(amountKobo));
    wallet.deployedKobo = String(Math.max(0, Number(wallet.deployedKobo) - Number(amountKobo)));
    wallet.totalReturnsKobo = String(Number(wallet.totalReturnsKobo) + Number(amountKobo));
    await this.walletsRepository.save(wallet);
  }

  async requestWithdrawal(sessionToken: string | undefined, amountKobo: string) {
    const user = await this.getSessionUser(sessionToken);
    const wallet = await this.getOrCreateWallet(user);
    const amount = Number(amountKobo);

    if (amount <= 0) {
      throw new BadRequestException("Withdrawal amount must be greater than zero.");
    }

    if (amount > Number(wallet.availableKobo)) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${Math.round(Number(wallet.availableKobo) / 100).toLocaleString()}.`
      );
    }

    const payout = await this.squadService.createPayout({
      amountKobo,
      reference: `lender-withdrawal-${user.id}-${Date.now()}`,
      narration: "Lender wallet withdrawal"
    });

    wallet.availableKobo = String(Number(wallet.availableKobo) - amount);
    await this.walletsRepository.save(wallet);

    return { success: true, payoutReference: payout.payoutReference, status: payout.status };
  }

  // ─── Portfolio ──────────────────────────────────────────────────────────────

  async getPortfolioSummary(sessionToken?: string) {
    const userId = await this.sessionService.getUserId(sessionToken);
    const loans = await this.loansRepository.find();
    const wallet = userId ? await this.walletsRepository.findOne({ where: { userId } }) : null;
    const totalAumKobo = loans.reduce((sum, loan) => sum + Number(loan.principalKobo), 0);

    return {
      totalAumKobo,
      activeLoans: loans.filter((loan) => loan.status === "active").length,
      totalLoans: loans.length,
      availableCapitalKobo: Number(wallet?.availableKobo ?? 0),
      deployedKobo: Number(wallet?.deployedKobo ?? 0),
      totalReturnsKobo: Number(wallet?.totalReturnsKobo ?? 0)
    };
  }

  getPipeline() {
    return this.getApplications();
  }

  async getApplications() {
    return this.applicationsRepository.find({ order: { createdAt: "DESC" } });
  }

  async decideApplication(id: string, dto: LoanDecisionDto, lenderSessionToken?: string) {
    const application = await this.applicationsRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException("Loan application not found");
    }

    if (dto.decision === "approve") {
      const lenderId = await this.sessionService.getUserId(lenderSessionToken);
      const lender = lenderId ? await this.usersRepository.findOne({ where: { id: lenderId } }) : null;
      const wallet = lenderId ? await this.walletsRepository.findOne({ where: { userId: lenderId } }) : null;
      const required = Number(application.amountKobo);

      if (wallet && Number(wallet.availableKobo) < required) {
        throw new BadRequestException(
          `Insufficient wallet balance. Available: ₦${Math.round(Number(wallet.availableKobo) / 100).toLocaleString()}, Required: ₦${Math.round(required / 100).toLocaleString()}. Top up your wallet first.`
        );
      }

      application.status = "approved";
      await this.applicationsRepository.save(application);

      const lenderName = lender?.businessName ?? lender?.fullName ?? "Trace Lender";
      const loan = this.loansRepository.create({
        userId: application.userId,
        lenderName,
        principalKobo: application.amountKobo,
        amountRepaidKobo: "0",
        rateLabel: "5% p/m",
        tenorLabel: application.tenor ?? "3 months",
        repaymentMethod: "cash_flow_indexed",
        repaymentPctLabel: "5%",
        status: "active"
      });
      await this.loansRepository.save(loan);

      if (wallet) {
        wallet.availableKobo = String(Number(wallet.availableKobo) - required);
        wallet.deployedKobo = String(Number(wallet.deployedKobo) + required);
        await this.walletsRepository.save(wallet);
      }
    } else {
      application.status = "declined";
      await this.applicationsRepository.save(application);
    }

    return { ...application, userId: application.userId };
  }

  async getMerchants() {
    return this.usersRepository.find({ where: { role: "trader" }, order: { createdAt: "DESC" } });
  }

  async getMerchantProfile(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("Merchant not found");
    return user;
  }

  async getMerchantTransactions(id: string) {
    return this.transactionsRepository.find({ where: { userId: id }, order: { occurredAt: "DESC" } });
  }

  async getMerchantLoans(id: string) {
    return this.loansRepository.find({ where: { userId: id }, order: { createdAt: "DESC" } });
  }

  async getMerchantScore(id: string) {
    return this.scoresRepository.findOne({ where: { userId: id }, order: { createdAt: "DESC" } });
  }

  async getHiringSignals() {
    const jobs = await this.jobsRepository.find();
    return {
      activeBorrowerJobs: jobs.filter((job) => job.status === "active").length,
      totalJobs: jobs.length
    };
  }

  async getPortfolioJobs() {
    return this.jobsRepository.find({ order: { createdAt: "DESC" } });
  }

  async getSettings(sessionToken?: string) {
    const userId = await this.sessionService.getUserId(sessionToken);
    const user = userId ? await this.usersRepository.findOne({ where: { id: userId } }) : null;
    return {
      institutionName: user?.businessName ?? user?.fullName ?? "",
      contactEmail: user?.email ?? "",
      phone: user?.phone ?? "",
      minScore: 600,
      maxAmountKobo: 500000000,
      riskTolerance: "medium"
    };
  }

  updateSettings(payload: Record<string, unknown>) {
    return { success: true, payload };
  }

  createSettlementAccount(payload: Record<string, unknown>) {
    return { success: true, account: payload };
  }

  getApiKeys() {
    return {
      publicKey: "trc_live_demo_public",
      docs: [
        "GET /api/v1/score",
        "POST /api/v1/lender/applications/:id/decision",
        "GET /api/v1/loans/:loanId/repayments"
      ]
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async getSessionUser(sessionToken?: string) {
    const userId = await this.sessionService.getUserId(sessionToken);
    if (!userId) throw new NotFoundException("No active session.");
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  private async getOrCreateWallet(user: User) {
    const existing = await this.walletsRepository.findOne({ where: { userId: user.id } });
    if (existing) return existing;
    return this.walletsRepository.save({
      userId: user.id,
      availableKobo: "0",
      deployedKobo: "0",
      totalDepositedKobo: "0",
      totalReturnsKobo: "0"
    });
  }
}
