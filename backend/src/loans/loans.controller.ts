import { Body, Controller, Get, Param, Post, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { CreateLoanApplicationDto } from "./dto/create-loan-application.dto";
import { LoansService } from "./loans.service";

@Controller("loans")
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Version("1")
  @Get("summary")
  getSummary(@Req() req: Request) {
    return this.loansService.getSummary(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Get("offers")
  getOffers(@Req() req: Request) {
    return this.loansService.getOffers(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Post("applications")
  createApplication(@Req() req: Request, @Body() dto: CreateLoanApplicationDto) {
    return this.loansService.createApplication(req.cookies?.kudiscore_session, dto);
  }

  @Version("1")
  @Get("applications")
  getApplications(@Req() req: Request) {
    return this.loansService.getApplications(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Post("offers/:offerId/accept")
  acceptOffer(@Param("offerId") offerId: string) {
    return this.loansService.acceptOffer(offerId);
  }

  @Version("1")
  @Get("active")
  getActiveLoan(@Req() req: Request) {
    return this.loansService.getActiveLoan(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Get(":loanId")
  getLoanById(@Param("loanId") loanId: string) {
    return this.loansService.getLoanById(loanId);
  }

  @Version("1")
  @Get(":loanId/repayments")
  getRepayments(@Param("loanId") loanId: string) {
    return this.loansService.getRepayments(loanId);
  }

  @Version("1")
  @Post(":loanId/manual-repayment")
  makeManualRepayment(@Param("loanId") loanId: string) {
    return this.loansService.makeManualRepayment(loanId);
  }
}
