import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { UsersService } from "../users/users.service";
import { VirtualAccountsService } from "../virtual-accounts/virtual-accounts.service";
import { SessionService } from "../session/session.service";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly virtualAccountsService: VirtualAccountsService,
    private readonly sessionService: SessionService
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.usersService.create({
      phone: dto.phone,
      fullName: dto.fullName,
      email: `${dto.phone.replace(/\D/g, "")}@trace.app`,
      businessName: dto.businessName,
      businessType: dto.businessType,
      marketName: dto.marketName,
      language: dto.language ?? "english",
      role: dto.role ?? "trader",
      bvn: dto.bvn,
      bvnLast4: dto.bvn.slice(-4)
    });

    try {
      const virtualAccount = await this.virtualAccountsService.provisionForUser(user);
      const token = createHash("sha256").update(`${user.id}:${user.phone}:${Date.now()}`).digest("hex");
      this.sessionService.createSession(token, user.id);

      return {
        user,
        virtualAccount,
        token
      };
    } catch (error) {
      await this.usersService.deleteById(user.id);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByPhone(dto.phone);
    const fallbackUser = !user ? await this.usersService.getCurrentUser() : user;
    const token = createHash("sha256").update(`${fallbackUser.id}:${dto.phone}:${dto.password}`).digest("hex");
    this.sessionService.createSession(token, fallbackUser.id);

    return {
      token,
      user: fallbackUser
    };
  }
}
