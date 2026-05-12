import { Controller, Get, VERSION_NEUTRAL, Version } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Version(VERSION_NEUTRAL)
  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }
}
