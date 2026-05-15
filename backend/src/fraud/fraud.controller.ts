import { Controller, Get, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { resolveToken } from "../session/resolve-token";
import { FraudService } from "./fraud.service";

@Controller("fraud-alerts")
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Version("1")
  @Get()
  getMyAlerts(@Req() req: Request) {
    return this.fraudService.getMyAlerts(resolveToken(req));
  }
}
