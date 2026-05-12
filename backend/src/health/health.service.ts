import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService
  ) {}

  async getHealth() {
    const db = await this.dataSource.query("SELECT 1");
    const redis = await this.redisService.ping();

    return {
      status: "ok",
      database: db[0] ? "up" : "down",
      redis: redis === "PONG" ? "up" : "down",
      timestamp: new Date().toISOString()
    };
  }
}
