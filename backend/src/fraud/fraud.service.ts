import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FraudAlert } from "../entities/fraud-alert.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class FraudService {
  constructor(
    @InjectRepository(FraudAlert)
    private readonly fraudAlertsRepository: Repository<FraudAlert>,
    private readonly usersService: UsersService
  ) {}

  async getMyAlerts(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.fraudAlertsRepository.find({
      where: { userId: user.id },
      order: { createdAt: "DESC" },
      take: 20,
    });
  }
}
