import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { ScoreController } from "./score.controller";
import { ScoreService } from "./score.service";
import { UsersModule } from "../users/users.module";
import { MlClientService } from "../ml/ml-client.service";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ScoreSnapshot]), UsersModule],
  controllers: [ScoreController],
  providers: [ScoreService, MlClientService],
  exports: [ScoreService, MlClientService],
})
export class ScoreModule {}
