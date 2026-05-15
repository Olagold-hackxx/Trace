import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoanApplication } from "../entities/loan-application.entity";
import { Loan } from "../entities/loan.entity";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { Transaction } from "../entities/transaction.entity";
import { User } from "../entities/user.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { RealtimeModule } from "../realtime/realtime.module";
import { SessionModule } from "../session/session.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, ScoreSnapshot, Loan, LoanApplication]), RealtimeModule, SessionModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
