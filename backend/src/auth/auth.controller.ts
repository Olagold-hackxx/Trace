import { Body, Controller, Post, Res, Version } from "@nestjs/common";
import { Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Version("1")
  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Version("1")
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    response.cookie("kudiscore_session", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    return result;
  }

  @Version("1")
  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("kudiscore_session");
    return { success: true };
  }
}
