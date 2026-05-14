import { Body, Controller, Get, Param, Patch, Post, Query, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Version("1")
  @Get("links")
  getLinks(@Req() req: Request) {
    return this.paymentsService.getLinks(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Get("links/default")
  getDefaultLink(@Req() req: Request) {
    return this.paymentsService.getDefaultLink(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Post("links")
  createLink(@Req() req: Request, @Body() dto: CreatePaymentLinkDto) {
    return this.paymentsService.createLink(req.cookies?.kudiscore_session, dto);
  }

  @Version("1")
  @Patch("links/:id")
  updateLink(@Param("id") id: string, @Body() dto: Partial<CreatePaymentLinkDto>) {
    return this.paymentsService.updateLink(id, dto);
  }

  @Version("1")
  @Post("initiate")
  initiatePayment(@Req() req: Request, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(req.cookies?.kudiscore_session, dto);
  }

  @Version("1")
  @Get("verify/:reference")
  verifyPayment(@Param("reference") reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Version("1")
  @Get("callback")
  paymentCallback(
    @Query("transaction_ref") transactionRef?: string,
    @Query("status") status?: string
  ) {
    return this.paymentsService.handleCallback(transactionRef, status);
  }
}
