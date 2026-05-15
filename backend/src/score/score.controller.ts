import { Controller, Get, Query, Req, Version } from "@nestjs/common";
import { Request } from "express";
import { ScoreService } from "./score.service";

@Controller("score")
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Version("1")
  @Get()
  getScore(@Req() req: Request) {
    return this.scoreService.getCurrentScore(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Get("explain")
  getExplanation(@Req() req: Request) {
    return this.scoreService.getExplanation(req.cookies?.kudiscore_session);
  }

  @Version("1")
  @Get("forecast")
  getForecast(@Req() req: Request, @Query("horizon_days") horizonDays?: string) {
    return this.scoreService.getForecast(
      req.cookies?.kudiscore_session,
      horizonDays ? Number.parseInt(horizonDays, 10) : 30,
    );
  }

  @Version("1")
  @Get("history")
  getHistory(@Req() req: Request) {
    return this.scoreService.getHistory(req.cookies?.kudiscore_session);
  }
}
