import { Controller, Get, Query, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { ScoreService } from "./score.service";
import { resolveToken } from "../session/resolve-token";

@Controller("score")
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Version("1")
  @Get()
  getScore(@Req() req: Request) {
    return this.scoreService.getCurrentScore(resolveToken(req));
  }

  @Version("1")
  @Get("explain")
  getExplanation(@Req() req: Request) {
    return this.scoreService.getExplanation(resolveToken(req));
  }

  @Version("1")
  @Get("forecast")
  getForecast(@Req() req: Request, @Query("horizon_days") horizonDays?: string) {
    return this.scoreService.getForecast(
      resolveToken(req),
      horizonDays ? Number.parseInt(horizonDays, 10) : 30,
    );
  }

  @Version("1")
  @Get("history")
  getHistory(@Req() req: Request) {
    return this.scoreService.getHistory(resolveToken(req));
  }
}
