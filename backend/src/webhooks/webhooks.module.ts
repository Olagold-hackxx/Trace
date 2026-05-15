import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LenderWallet } from "../entities/lender-wallet.entity";
import { Transaction } from "../entities/transaction.entity";
import { LenderModule } from "../lender/lender.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { SquadModule } from "../squad/squad.module";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, LenderWallet]), RealtimeModule, SquadModule, LenderModule],
  controllers: [WebhooksController],
  providers: [WebhooksService]
})
export class WebhooksModule {}
