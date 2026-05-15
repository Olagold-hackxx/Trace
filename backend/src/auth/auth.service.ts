import { randomBytes } from "crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { VirtualAccountsService } from "../virtual-accounts/virtual-accounts.service";
import { SessionService } from "../session/session.service";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly virtualAccountsService: VirtualAccountsService,
    private readonly sessionService: SessionService
  ) {}

  async signup(dto: SignupDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      phone: dto.phone,
      passwordHash,
      fullName: dto.fullName,
      email: dto.email,
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
      const token = randomBytes(32).toString("hex");
      await this.sessionService.createSession(token, user.id);
      const { passwordHash: _, ...safeUser } = user;
      return { user: safeUser, virtualAccount, token };
    } catch (error) {
      await this.usersService.deleteById(user.id);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findForAuth(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const token = randomBytes(32).toString("hex");
    await this.sessionService.createSession(token, user.id);

    const { passwordHash: _, ...safeUser } = user;
    return { token, user: safeUser };
  }
}
