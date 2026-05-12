import { Body, Controller, Get, Param, Post, Version } from "@nestjs/common";
import { CreateLoanApplicationDto } from "./dto/create-loan-application.dto";
import { LoansService } from "./loans.service";

@Controller("loans")
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Version("1")
  @Get("summary")
  getSummary() {
    return this.loansService.getSummary();
  }

  @Version("1")
  @Get("offers")
  getOffers() {
    return this.loansService.getOffers();
  }

  @Version("1")
  @Post("applications")
  createApplication(@Body() dto: CreateLoanApplicationDto) {
    return this.loansService.createApplication(dto);
  }

  @Version("1")
  @Get("applications")
  getApplications() {
    return this.loansService.getApplications();
  }

  @Version("1")
  @Post("offers/:offerId/accept")
  acceptOffer(@Param("offerId") offerId: string) {
    return this.loansService.acceptOffer(offerId);
  }

  @Version("1")
  @Get("active")
  getActiveLoan() {
    return this.loansService.getActiveLoan();
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
