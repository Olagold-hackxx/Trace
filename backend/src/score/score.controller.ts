import { Controller, Get, Version } from "@nestjs/common";
import { ScoreService } from "./score.service";

@Controller("score")
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Version("1")
  @Get()
  getScore() {
    return this.scoreService.getCurrentScore();
  }

  @Version("1")
  @Get("explain")
  getExplanation() {
    return this.scoreService.getExplanation();
  }

  @Version("1")
  @Get("history")
  getHistory() {
    return this.scoreService.getHistory();
  }
}
