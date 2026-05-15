import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoanApplication } from "../entities/loan-application.entity";
import { Loan } from "../entities/loan.entity";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { Transaction } from "../entities/transaction.entity";
import { User } from "../entities/user.entity";
import { FraudAlert } from "../entities/fraud-alert.entity";
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
    @InjectRepository(FraudAlert)
    private readonly fraudAlertsRepository: Repository<FraudAlert>,
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
      metrics: { demographicParity: 0.93, equalizedOdds: 0.89, calibrationGap: 0.02 }
    };
  }

  async getFraudAlerts() {
    const alerts = await this.fraudAlertsRepository.find({
      order: { createdAt: "DESC" },
      take: 50,
    });

    // Enrich with trader name in one batch query
    const userIds = [...new Set(alerts.map((a) => a.userId))];
    const users = userIds.length
      ? await this.usersRepository.findByIds(userIds)
      : [];
    const userMap = new Map(users.map((u) => [u.id, u.fullName]));

    return alerts.map((a) => ({
      id: a.id,
      transactionId: a.transactionId,
      userId: a.userId,
      traderName: userMap.get(a.userId) ?? "Unknown",
      anomalyScore: a.anomalyScore,
      isAnomalous: a.isAnomalous,
      topSignals: a.topSignals,
      fraudPenalty: a.fraudPenalty,
      severity: a.severity,
      status: a.status,
      reviewedAt: a.reviewedAt,
      createdAt: a.createdAt,
    }));
  }

  async seedTransactions(payload: Record<string, unknown>) {
    return { success: true, seeded: payload };
  }

  async triggerFraud(payload: Record<string, unknown>) {
    const userId = String(payload.userId ?? "demo-user");
    await this.realtimeService.publishToUser(userId, "fraud.alert", {
      anomalyScore: 0.91,
      severity: "high",
      topSignals: ["amount_spike", "unseen_sender"],
      message: "Anomalous activity detected. Score frozen pending review.",
    });
    return { success: true, payload };
  }
}
