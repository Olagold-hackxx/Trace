import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoanApplication } from "../entities/loan-application.entity";
import { Loan } from "../entities/loan.entity";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { Transaction } from "../entities/transaction.entity";
import { User } from "../entities/user.entity";
import { RealtimeService } from "../realtime/realtime.service";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(ScoreSnapshot)
    private readonly scoresRepository: Repository<ScoreSnapshot>,
    @InjectRepository(Loan)
    private readonly loansRepository: Repository<Loan>,
    @InjectRepository(LoanApplication)
    private readonly applicationsRepository: Repository<LoanApplication>,
    private readonly realtimeService: RealtimeService
  ) {}

  async getOverview() {
    const [users, transactions, loans, applications] = await Promise.all([
      this.usersRepository.count(),
      this.transactionsRepository.count(),
      this.loansRepository.count(),
      this.applicationsRepository.count()
    ]);

    return { users, transactions, loans, applications };
  }

  getFairness() {
    return {
      status: "stubbed",
      metrics: {
        demographicParity: 0.93,
        equalizedOdds: 0.89,
        calibrationGap: 0.02
      }
    };
  }

  getFraudAlerts() {
    return [
      {
        id: "fraud-demo-1",
        severity: "medium",
        reason: "Round amount spike from unseen sender",
        status: "under_review"
      }
    ];
  }

  async seedTransactions(payload: Record<string, unknown>) {
    return {
      success: true,
      seeded: payload
    };
  }

  async triggerFraud(payload: Record<string, unknown>) {
    await this.realtimeService.publishToUser(String(payload.userId ?? "demo-user"), "fraud.alert", {
      message: "Anomalous activity detected. Score frozen pending review."
    });

    return {
      success: true,
      payload
    };
  }
}
