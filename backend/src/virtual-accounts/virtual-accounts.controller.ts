import { Controller, Get, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { VirtualAccountsService } from "./virtual-accounts.service";

@Controller("virtual-accounts")
export class VirtualAccountsController {
  constructor(private readonly virtualAccountsService: VirtualAccountsService) {}

  @Version("1")
  @Get("me")
  getMine(@Req() req: Request) {
    return this.virtualAccountsService.getCurrentUserAccount(req.cookies?.kudiscore_session);
  }
}
