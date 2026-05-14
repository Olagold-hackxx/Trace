import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(ScoreSnapshot)
    private readonly snapshotsRepository: Repository<ScoreSnapshot>,
    private readonly usersService: UsersService
  ) {}

  async getCurrentScore(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    const snapshot = await this.ensureSeedSnapshot(user.id);
    return snapshot;
  }

  async getExplanation(sessionToken?: string) {
    const snapshot = await this.getCurrentScore(sessionToken);
    return {
      score: snapshot.score,
      factors: snapshot.factors
    };
  }

  async getHistory(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.snapshotsRepository.find({
      where: { userId: user.id },
      order: { createdAt: "ASC" }
    });
  }

  private async ensureSeedSnapshot(userId: string) {
    const existing = await this.snapshotsRepository.findOne({
      where: { userId },
      order: { createdAt: "DESC" }
    });

    if (existing) {
      return existing;
    }

    return this.snapshotsRepository.save({
      userId,
      score: 742,
      subScores: {
        paymentHistory: 90,
        revenueConsistency: 74,
        businessLongevity: 68,
        employmentRecord: 55,
        lenderTrust: 82
      },
      factors: [
        { direction: "positive", text: "Your revenue grew 18% last month." },
        { direction: "negative", text: "One customer accounts for a high share of income." }
      ],
      modelVersion: "seeded-v1"
    });
  }
}
