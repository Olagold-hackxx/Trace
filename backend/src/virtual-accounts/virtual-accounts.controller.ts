import { Controller, Get, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { VirtualAccountsService } from "./virtual-accounts.service";
import { resolveToken } from "../session/resolve-token";

@Controller("virtual-accounts")
export class VirtualAccountsController {
  constructor(private readonly virtualAccountsService: VirtualAccountsService) {}

  @Version("1")
  @Get("me")
  getMine(@Req() req: Request) {
    return this.virtualAccountsService.getCurrentUserAccount(resolveToken(req));
  }
}
