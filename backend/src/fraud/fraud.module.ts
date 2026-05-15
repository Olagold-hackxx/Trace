import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FraudAlert } from "../entities/fraud-alert.entity";
import { UsersModule } from "../users/users.module";
import { FraudController } from "./fraud.controller";
import { FraudService } from "./fraud.service";

@Module({
  imports: [TypeOrmModule.forFeature([FraudAlert]), UsersModule],
  controllers: [FraudController],
  providers: [FraudService],
})
export class FraudModule {}
