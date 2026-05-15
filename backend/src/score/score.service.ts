import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { UsersService } from "../users/users.service";
import { MlClientService } from "../ml/ml-client.service";

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(
    @InjectRepository(ScoreSnapshot)
    private readonly snapshotsRepository: Repository<ScoreSnapshot>,
    private readonly usersService: UsersService,
    private readonly mlClient: MlClientService,
  ) {}

  async getCurrentScore(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    try {
      const mlResult = await this.mlClient.predictScore(user.id);
      return this.snapshotsRepository.save({
        userId: user.id,
        score: mlResult.score,
        pd: mlResult.pd,
        subScores: mlResult.sub_scores as unknown as Record<string, unknown>,
        factors: [],
        modelVersion: mlResult.model_version,
      });
    } catch {
      this.logger.warn(`ML service unavailable for score — using fallback for user ${user.id}`);
      return this.ensureFallbackSnapshot(user.id);
    }
  }

  async getExplanation(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);

    try {
      const mlResult = await this.mlClient.predictExplain(user.id);
      return {
        score: mlResult.score,
        pd: mlResult.pd,
        factors: [
          ...mlResult.helping.map((f) => ({ direction: "positive", text: f.phrasing })),
          ...mlResult.hurting.map((f) => ({ direction: "negative", text: f.phrasing })),
        ],
        modelVersion: mlResult.model_version,
      };
    } catch {
      this.logger.warn(`ML service unavailable for explain — using fallback for user ${user.id}`);
      const snapshot = await this.ensureFallbackSnapshot(user.id);
      return { score: snapshot.score, pd: snapshot.pd, factors: snapshot.factors, modelVersion: snapshot.modelVersion };
    }
  }

  async getForecast(sessionToken?: string, horizonDays = 30) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.mlClient.predictForecast(user.id, horizonDays);
  }

  async getHistory(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.snapshotsRepository.find({
      where: { userId: user.id },
      order: { createdAt: "ASC" },
    });
  }

  private async ensureFallbackSnapshot(userId: string) {
    const existing = await this.snapshotsRepository.findOne({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    if (existing) {
      return existing;
    }

    return this.snapshotsRepository.save({
      userId,
      score: 742,
      subScores: {
        cash_flow_stability: 74,
        customer_base: 68,
        growth: 55,
        reliability: 82,
      },
      factors: [
        { direction: "positive", text: "Your revenue grew 18% last month." },
        { direction: "negative", text: "One customer accounts for a high share of income." },
      ],
      modelVersion: "seeded-v1",
    });
  }
}
