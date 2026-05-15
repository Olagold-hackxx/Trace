import { Body, Controller, Post, Req, Res, Version } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { AuthService } from "./auth.service";
import { SessionService } from "../session/session.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService
  ) {}

  @Version("1")
  @Post("signup")
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.signup(dto);
    response.cookie("kudiscore_session", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return result;
  }

  @Version("1")
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    response.cookie("kudiscore_session", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return result;
  }

  @Version("1")
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const token = req.cookies?.kudiscore_session;
    if (token) {
      await this.sessionService.clearSession(token);
    }
    response.clearCookie("kudiscore_session");
    return { success: true };
  }
}
