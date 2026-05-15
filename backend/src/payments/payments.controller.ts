import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, Version } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { Request } from "express";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { PaymentsService } from "./payments.service";
import { resolveToken } from "../session/resolve-token";

@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService
  ) {}

  @Version("1")
  @Get("links")
  getLinks(@Req() req: Request) {
    return this.paymentsService.getLinks(resolveToken(req));
  }

  @Version("1")
  @Get("links/default")
  getDefaultLink(@Req() req: Request) {
    return this.paymentsService.getDefaultLink(resolveToken(req));
  }

  @Version("1")
  @Post("links")
  createLink(@Req() req: Request, @Body() dto: CreatePaymentLinkDto) {
    return this.paymentsService.createLink(resolveToken(req), dto);
  }

  @Version("1")
  @Patch("links/:id")
  updateLink(@Param("id") id: string, @Body() dto: Partial<CreatePaymentLinkDto>, @Req() req: Request) {
    return this.paymentsService.updateLink(id, dto, req.cookies?.kudiscore_session);
  }

  // ── QR: permanent flexible link for a slug ───────────────────────────────────
  @Version("1")
  @Get("qr/:slug")
  async getQrForSlug(@Param("slug") slug: string, @Res() res: Response) {
    const png = await this.paymentsService.getQrForSlug(slug);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(png);
  }

  // ── QR: one-time fixed-amount — returns QR image directly ───────────────────
  @Version("1")
  @Post("qr/one-time")
  async getOneTimeQr(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: { amountKobo: string; description?: string; email?: string }
  ) {
    const result = await this.paymentsService.getOneTimeQr(
      req.cookies?.kudiscore_session,
      body.amountKobo,
      body.description,
      body.email
    );
    res.setHeader("Content-Type", "image/png");
    res.setHeader("X-Checkout-Url", result.checkoutUrl);
    res.setHeader("X-Reference", result.reference);
    res.send(result.qrPng);
  }

  // ── Public: get link info (no auth — for /pay/[slug] page) ──────────────────
  @Version("1")
  @Get("public/:slug")
  getLinkBySlug(@Param("slug") slug: string) {
    return this.paymentsService.getLinkBySlug(slug);
  }

  // ── Public: initiate payment from /pay/[slug] page ───────────────────────────
  @Version("1")
  @Post("public/:slug/pay")
  initiatePublicPayment(
    @Param("slug") slug: string,
    @Body() body: { amountKobo: string; email: string; description?: string }
  ) {
    return this.paymentsService.initiatePublicPayment(slug, body.amountKobo, body.email, body.description);
  }

  @Version("1")
  @Post("initiate")
  initiatePayment(@Req() req: Request, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(resolveToken(req), dto);
  }

  @Version("1")
  @Get("verify/:reference")
  verifyPayment(@Param("reference") reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Version("1")
  @Get("callback")
  async paymentCallback(
    @Res() res: Response,
    @Query("reference") reference?: string,
    @Query("transaction_ref") transactionRef?: string,
    @Query("status") status?: string
  ) {
    const ref = reference ?? transactionRef ?? "";
    if (ref) {
      try {
        await this.paymentsService.verifyPayment(ref);
      } catch {
        // best-effort — webhook may have already handled it
      }
    }
    const frontendBase = this.configService.get<string>("FRONTEND_URL") ?? "https://trace-nu-dusky.vercel.app";
    return res.redirect(`${frontendBase}/payments?ref=${ref}&status=${status ?? "success"}`);
  }
}
