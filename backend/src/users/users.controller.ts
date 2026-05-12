import { Body, Controller, Get, Param, Patch, Version } from "@nestjs/common";
import { UpdateUserSettingsDto } from "./dto/update-user-settings.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Version("1")
  @Get("me")
  async getMe() {
    return this.usersService.getCurrentUser();
  }

  @Version("1")
  @Patch("me")
  async updateMe(@Body() dto: UpdateUserSettingsDto) {
    return this.usersService.updateCurrentUser(dto);
  }

  @Version("1")
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }
}
