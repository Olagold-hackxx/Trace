import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VirtualAccount } from "../entities/virtual-account.entity";
import { SquadService } from "../squad/squad.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class VirtualAccountsService {
  constructor(
    @InjectRepository(VirtualAccount)
    private readonly accountsRepository: Repository<VirtualAccount>,
    private readonly usersService: UsersService,
    private readonly squadService: SquadService
  ) {}

  async getCurrentUserAccount() {
    const user = await this.usersService.getCurrentUser();
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
    });

    return this.accountsRepository.save({
      userId: user.id,
      accountNumber: provisioned.accountNumber,
      squadCustomerId: provisioned.customerId,
      bankName: provisioned.bankName,
      status: "active"
    });
  }
}
