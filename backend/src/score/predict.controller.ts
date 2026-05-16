import { Controller, Get, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { MlClientService } from "../ml/ml-client.service";
import { UsersService } from "../users/users.service";
import { resolveToken } from "../session/resolve-token";

@Controller("predict")
export class PredictController {
  constructor(
    private readonly mlClient: MlClientService,
    private readonly usersService: UsersService,
  ) {}

  @Version("1")
  @Get("explain")
  async getExplain(@Req() req: Request) {
    const user = await this.usersService.getCurrentUser(resolveToken(req));
    return this.mlClient.predictExplain(user.id);
  }
}
