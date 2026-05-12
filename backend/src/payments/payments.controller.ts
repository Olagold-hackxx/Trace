import { Body, Controller, Get, Param, Patch, Post, Query, Version } from "@nestjs/common";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Version("1")
  @Get("links")
  getLinks() {
    return this.paymentsService.getLinks();
  }

  @Version("1")
  @Get("links/default")
  getDefaultLink() {
    return this.paymentsService.getDefaultLink();
  }

  @Version("1")
  @Post("links")
  createLink(@Body() dto: CreatePaymentLinkDto) {
    return this.paymentsService.createLink(dto);
  }

  @Version("1")
  @Patch("links/:id")
  updateLink(@Param("id") id: string, @Body() dto: Partial<CreatePaymentLinkDto>) {
    return this.paymentsService.updateLink(id, dto);
  }

  @Version("1")
  @Post("initiate")
  initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(dto);
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
