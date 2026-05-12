import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { REALTIME_EVENTS } from "../common/constants/realtime-events";
import { RedisService } from "../redis/redis.service";

export interface UserRealtimeEvent {
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

@Injectable()
export class RealtimeService {
  private readonly streams = new Map<string, Subject<UserRealtimeEvent>>();

  constructor(private readonly redisService: RedisService) {}

  streamForUser(userId: string): Observable<UserRealtimeEvent> {
    return this.getSubject(userId).asObservable();
  }

  async publishToUser(userId: string, type: string, payload: Record<string, unknown>): Promise<void> {
    const event: UserRealtimeEvent = {
      type,
      payload,
      createdAt: new Date().toISOString()
    };

    this.getSubject(userId).next(event);
    await this.redisService.publish(`user:${userId}:events`, event);
  }

  async publishTransactionCreated(userId: string, payload: Record<string, unknown>): Promise<void> {
    await this.publishToUser(userId, REALTIME_EVENTS.TRANSACTION_CREATED, payload);
  }

  async publishLoanDisbursed(userId: string, payload: Record<string, unknown>): Promise<void> {
    await this.publishToUser(userId, REALTIME_EVENTS.LOAN_DISBURSED, payload);
  }

  async publishFraudAlert(userId: string, payload: Record<string, unknown>): Promise<void> {
    await this.publishToUser(userId, REALTIME_EVENTS.FRAUD_ALERT, payload);
  }

  private getSubject(userId: string): Subject<UserRealtimeEvent> {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject<UserRealtimeEvent>());
    }

    return this.streams.get(userId)!;
  }
}
