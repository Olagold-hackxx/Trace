import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScoreSnapshot } from "../entities/score-snapshot.entity";
import { ScoreController } from "./score.controller";
import { ScoreService } from "./score.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([ScoreSnapshot]), UsersModule],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService]
})
export class ScoreModule {}
