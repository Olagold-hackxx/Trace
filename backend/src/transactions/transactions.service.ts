import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction } from "../entities/transaction.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly usersService: UsersService
  ) {}

  async getTransactions(sessionToken: string | undefined, limit = 20) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.transactionsRepository.find({
      where: { userId: user.id },
      order: { occurredAt: "DESC" },
      take: limit
    });
  }

  async getSummary(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    const items = await this.transactionsRepository.find({ where: { userId: user.id } });

    const totalInflow = items
      .filter((item) => item.status === "success" && item.type !== "debit")
      .reduce((sum, item) => sum + Number(item.amountKobo), 0);
    const totalOutflow = items
      .filter((item) => item.type === "debit")
      .reduce((sum, item) => sum + Number(item.amountKobo), 0);

    return {
      totalInflowKobo: totalInflow,
      totalOutflowKobo: totalOutflow,
      balanceKobo: totalInflow - totalOutflow,
      transactionCount: items.length
    };
  }
}
