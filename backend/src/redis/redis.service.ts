import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>("REDIS_HOST"),
      port: Number(this.configService.get<string>("REDIS_PORT") ?? 6379),
      password: this.configService.get<string>("REDIS_PASSWORD") || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 2
    });
  }

  async ping(): Promise<string> {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
    return this.client.ping();
  }

  async publish(channel: string, message: unknown): Promise<number> {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
    return this.client.publish(channel, JSON.stringify(message));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
