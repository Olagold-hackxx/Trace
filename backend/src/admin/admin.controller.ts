import { Body, Controller, Get, Post, Req, UnauthorizedException, Version } from "@nestjs/common";
import { Request } from "express";
import { AdminService } from "./admin.service";
import { SessionService } from "../session/session.service";
import { resolveToken } from "../session/resolve-token";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly sessionService: SessionService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {}

  private async requireAdmin(req: Request) {
    const userId = await this.sessionService.getUserId(resolveToken(req));
    if (!userId) throw new UnauthorizedException("Not authenticated.");
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== "admin") throw new UnauthorizedException("Admin access only.");
  }

  @Version("1")
  @Get("overview")
  async getOverview(@Req() req: Request) {
    await this.requireAdmin(req);
    return this.adminService.getOverview();
  }

  @Version("1")
  @Get("fairness")
  async getFairness(@Req() req: Request) {
    await this.requireAdmin(req);
    return this.adminService.getFairness();
  }

  @Version("1")
  @Get("fraud-alerts")
  async getFraudAlerts(@Req() req: Request) {
    await this.requireAdmin(req);
    return this.adminService.getFraudAlerts();
  }

  @Version("1")
  @Post("demo/seed-txns")
  async seedTransactions(@Req() req: Request, @Body() payload: Record<string, unknown>) {
    await this.requireAdmin(req);
    return this.adminService.seedTransactions(payload);
  }

  @Version("1")
  @Post("demo/trigger-fraud")
  async triggerFraud(@Req() req: Request, @Body() payload: Record<string, unknown>) {
    await this.requireAdmin(req);
    return this.adminService.triggerFraud(payload);
  }
}
