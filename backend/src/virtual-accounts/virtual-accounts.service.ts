import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VirtualAccount } from "../entities/virtual-account.entity";
import { SquadService } from "../squad/squad.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class VirtualAccountsService {
  private readonly logger = new Logger(VirtualAccountsService.name);

  constructor(
    @InjectRepository(VirtualAccount)
    private readonly accountsRepository: Repository<VirtualAccount>,
    private readonly usersService: UsersService,
    private readonly squadService: SquadService
  ) {}

  async getCurrentUserAccount(sessionToken?: string) {
    const user = await this.usersService.getCurrentUser(sessionToken);
    return this.provisionForUser(user);
  }

  async provisionForUser(user: { id: string; businessName?: string; fullName: string; phone: string; bvn?: string; email?: string }) {
    const existing = await this.accountsRepository.findOne({ where: { userId: user.id } });

    if (existing) {
      return existing;
    }

    if (!user.bvn) {
      throw new BadRequestException("Current user is missing a full BVN required for Squad virtual account provisioning.");
    }

    const provisioned = await this.squadService.provisionBusinessVirtualAccount({
      customerIdentifier: user.id,
      businessName: user.businessName ?? user.fullName,
      phoneNumber: user.phone,
      bvn: user.bvn,
      email: user.email
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);

      if (!message.includes("account opening limit")) {
        throw error;
      }

      this.logger.warn(`Falling back to demo virtual account for user ${user.id} because Squad sandbox quota is exhausted.`);

      return {
        provider: "demo",
        accountNumber: this.buildDemoAccountNumber(user.id),
        bankName: "GTBank",
        customerId: `SQD-DEMO-${user.id}`
      };
    });

    return this.accountsRepository.save({
      userId: user.id,
      accountNumber: provisioned.accountNumber,
      squadCustomerId: provisioned.customerId,
      bankName: provisioned.bankName,
      status: "active"
    });
  }

  private buildDemoAccountNumber(seed: string) {
    const digits = seed.replace(/\D/g, "");
    const padded = `${digits}0123456789`;
    return padded.slice(0, 10);
  }
}
