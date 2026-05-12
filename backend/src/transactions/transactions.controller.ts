import { Controller, Get, MessageEvent, Param, Query, Sse, Version } from "@nestjs/common";
import { map, Observable, startWith } from "rxjs";
import { RealtimeService } from "../realtime/realtime.service";
import { TransactionsService } from "./transactions.service";

@Controller()
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly realtimeService: RealtimeService
  ) {}

  @Version("1")
  @Get("transactions")
  getTransactions(@Query("limit") limit?: string) {
    return this.transactionsService.getTransactions(limit ? Number(limit) : 20);
  }

  @Version("1")
  @Get("transactions/summary")
  getSummary() {
    return this.transactionsService.getSummary();
  }

  @Version("1")
  @Sse("stream/user/:userId")
  streamUser(@Param("userId") userId: string): Observable<MessageEvent> {
    return this.realtimeService.streamForUser(userId).pipe(
      map((event) => ({ data: event })),
      startWith({
        data: {
          type: "stream.connected",
          payload: { userId },
          createdAt: new Date().toISOString()
        }
      })
    );
  }
}
