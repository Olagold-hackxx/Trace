import { Body, Controller, Get, Post, Version } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Version("1")
  @Get("overview")
  getOverview() {
    return this.adminService.getOverview();
  }

  @Version("1")
  @Get("fairness")
  getFairness() {
    return this.adminService.getFairness();
  }

  @Version("1")
  @Get("fraud-alerts")
  getFraudAlerts() {
    return this.adminService.getFraudAlerts();
  }

  @Version("1")
  @Post("demo/seed-txns")
  seedTransactions(@Body() payload: Record<string, unknown>) {
    return this.adminService.seedTransactions(payload);
  }

  @Version("1")
  @Post("demo/trigger-fraud")
  triggerFraud(@Body() payload: Record<string, unknown>) {
    return this.adminService.triggerFraud(payload);
  }
}
