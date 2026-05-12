import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "../entities/job.entity";
import { LoanApplication } from "../entities/loan-application.entity";
import { Loan } from "../entities/loan.entity";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { Transaction } from "../entities/transaction.entity";
import { User } from "../entities/user.entity";
import { LenderController } from "./lender.controller";
import { LenderService } from "./lender.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, LoanApplication, Loan, Transaction, ScoreSnapshot, Job])],
  controllers: [LenderController],
  providers: [LenderService]
})
export class LenderModule {}
