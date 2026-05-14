import { Body, Controller, Get, Param, Patch, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Version("1")
  @Get("me")
  async getMe(@Req() req: Request) {
    return this.usersService.getCurrentUser(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Patch("me")
  async updateMe(@Req() req: Request, @Body() dto: UpdateUserSettingsDto) {
    return this.usersService.updateCurrentUser(req.cookies?.kudiscore_session, dto);
  }

  @Version("1")
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }
}
