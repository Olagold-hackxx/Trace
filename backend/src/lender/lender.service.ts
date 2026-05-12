import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "../entities/job.entity";
import { LoanApplication } from "../entities/loan-application.entity";
import { Loan } from "../entities/loan.entity";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { Transaction } from "../entities/transaction.entity";
import { User } from "../entities/user.entity";
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
    private readonly jobsRepository: Repository<Job>
  ) {}

  async getPortfolioSummary() {
    const loans = await this.loansRepository.find();
    const totalAumKobo = loans.reduce((sum, loan) => sum + Number(loan.principalKobo), 0);
    return {
      totalAumKobo,
      activeLoans: loans.filter((loan) => loan.status === "active").length,
      totalLoans: loans.length
    };
  }

  getPipeline() {
    return this.getApplications();
  }

  async getApplications() {
    return this.applicationsRepository.find({
      order: { createdAt: "DESC" }
    });
  }

  async decideApplication(id: string, dto: LoanDecisionDto) {
    const application = await this.applicationsRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException("Loan application not found");
    }

    application.status = dto.decision === "approve" ? "approved" : "declined";
    return this.applicationsRepository.save(application);
  }

  async getMerchants() {
    return this.usersRepository.find({
      where: { role: "trader" },
      order: { createdAt: "DESC" }
    });
  }

  async getMerchantProfile(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("Merchant not found");
    }

    return user;
  }

  async getMerchantTransactions(id: string) {
    return this.transactionsRepository.find({
      where: { userId: id },
      order: { occurredAt: "DESC" }
    });
  }

  async getMerchantLoans(id: string) {
    return this.loansRepository.find({
      where: { userId: id },
      order: { createdAt: "DESC" }
    });
  }

  async getMerchantScore(id: string) {
    return this.scoresRepository.findOne({
      where: { userId: id },
      order: { createdAt: "DESC" }
    });
  }

  async getHiringSignals() {
    const jobs = await this.jobsRepository.find();
    return {
      activeBorrowerJobs: jobs.filter((job) => job.status === "active").length,
      totalJobs: jobs.length
    };
  }

  async getPortfolioJobs() {
    return this.jobsRepository.find({
      order: { createdAt: "DESC" }
    });
  }

  getSettings() {
    return {
      institutionName: "Zenith Capital Finance",
      minScore: 600,
      maxAmountKobo: 500000000,
      riskTolerance: "medium"
    };
  }

  updateSettings(payload: Record<string, unknown>) {
    return {
      success: true,
      payload
    };
  }

  createSettlementAccount(payload: Record<string, unknown>) {
    return {
      success: true,
      account: payload
    };
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
}
