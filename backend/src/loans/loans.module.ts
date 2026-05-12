import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoanApplication } from "../entities/loan-application.entity";
import { LoanOffer } from "../entities/loan-offer.entity";
import { Loan } from "../entities/loan.entity";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";
import { RealtimeModule } from "../realtime/realtime.module";
import { SquadModule } from "../squad/squad.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([LoanApplication, LoanOffer, Loan]), UsersModule, RealtimeModule, SquadModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService]
})
export class LoansModule {}
