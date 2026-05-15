import { Controller, Get, MessageEvent, Param, Query, Req, Sse, Version } from "@nestjs/common";
import { Request } from "express";
import { map, Observable, startWith } from "rxjs";
import { RealtimeService } from "../realtime/realtime.service";
import { TransactionsService } from "./transactions.service";
import { resolveToken } from "../session/resolve-token";

@Controller()
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly realtimeService: RealtimeService
  ) {}

  @Version("1")
  @Get("transactions")
  getTransactions(@Req() req: Request, @Query("limit") limit?: string) {
    return this.transactionsService.getTransactions(resolveToken(req), limit ? Number(limit) : 20);
  }

  @Version("1")
  @Get("transactions/summary")
  getSummary(@Req() req: Request) {
    return this.transactionsService.getSummary(resolveToken(req));
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
