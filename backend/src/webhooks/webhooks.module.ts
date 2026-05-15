import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LenderWallet } from "../entities/lender-wallet.entity";
import { Transaction } from "../entities/transaction.entity";
import { FraudAlert } from "../entities/fraud-alert.entity";
import { LenderModule } from "../lender/lender.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { SquadModule } from "../squad/squad.module";
import { MlClientService } from "../ml/ml-client.service";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Transaction, LenderWallet, FraudAlert]),
    RealtimeModule, SquadModule, LenderModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, MlClientService],
})
export class WebhooksModule {}
