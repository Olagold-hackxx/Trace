import { Body, Controller, Get, Param, Patch, Post, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { LoanDecisionDto } from "./dto/loan-decision.dto";
import { LenderService } from "./lender.service";

@Controller("lender")
export class LenderController {
  constructor(private readonly lenderService: LenderService) {}

  // ─── Wallet ────────────────────────────────────────────────────────────────

  @Version("1")
  @Get("wallet")
  getWallet(@Req() req: Request) {
    return this.lenderService.getWallet(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Post("wallet/provision")
  provisionWalletAccount(@Req() req: Request) {
    return this.lenderService.provisionWalletAccount(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Post("wallet/withdraw")
  requestWithdrawal(@Req() req: Request, @Body() body: { amountKobo: string }) {
    return this.lenderService.requestWithdrawal(req.cookies?.kudiscore_session, body.amountKobo);
  }

  // ─── Portfolio ──────────────────────────────────────────────────────────────

  @Version("1")
  @Get("portfolio/summary")
  getPortfolioSummary(@Req() req: Request) {
    return this.lenderService.getPortfolioSummary(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Get("pipeline")
  getPipeline() {
    return this.lenderService.getPipeline();
  }

  @Version("1")
  @Get("applications")
  getApplications() {
    return this.lenderService.getApplications();
  }

  @Version("1")
  @Post("applications/:id/decision")
  decideApplication(@Param("id") id: string, @Body() dto: LoanDecisionDto, @Req() req: Request) {
    return this.lenderService.decideApplication(id, dto, req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Get("merchants")
  getMerchants() {
    return this.lenderService.getMerchants();
  }

  @Version("1")
  @Get("merchants/:id/profile")
  getMerchantProfile(@Param("id") id: string) {
    return this.lenderService.getMerchantProfile(id);
  }

  @Version("1")
  @Get("merchants/:id/transactions")
  getMerchantTransactions(@Param("id") id: string) {
    return this.lenderService.getMerchantTransactions(id);
  }

  @Version("1")
  @Get("merchants/:id/loans")
  getMerchantLoans(@Param("id") id: string) {
    return this.lenderService.getMerchantLoans(id);
  }

  @Version("1")
  @Get("merchants/:id/score")
  getMerchantScore(@Param("id") id: string) {
    return this.lenderService.getMerchantScore(id);
  }

  @Version("1")
  @Get("hiring-signals")
  getHiringSignals() {
    return this.lenderService.getHiringSignals();
  }

  @Version("1")
  @Get("portfolio/jobs")
  getPortfolioJobs() {
    return this.lenderService.getPortfolioJobs();
  }

  @Version("1")
  @Get("settings")
  getSettings(@Req() req: Request) {
    return this.lenderService.getSettings(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Patch("settings")
  updateSettings(@Body() payload: Record<string, unknown>) {
    return this.lenderService.updateSettings(payload);
  }

  @Version("1")
  @Post("settlement-accounts")
  createSettlementAccount(@Body() payload: Record<string, unknown>) {
    return this.lenderService.createSettlementAccount(payload);
  }

  @Version("1")
  @Get("api-keys")
  getApiKeys() {
    return this.lenderService.getApiKeys();
  }
}
