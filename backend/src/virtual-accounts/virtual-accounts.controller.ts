import { Controller, Get, Version } from "@nestjs/common";
import { VirtualAccountsService } from "./virtual-accounts.service";

@Controller("virtual-accounts")
export class VirtualAccountsController {
  constructor(private readonly virtualAccountsService: VirtualAccountsService) {}

  @Version("1")
  @Get("me")
  getMine() {
    return this.virtualAccountsService.getCurrentUserAccount();
  }
}
