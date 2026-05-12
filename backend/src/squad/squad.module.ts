import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SquadService } from "./squad.service";

@Module({
  imports: [HttpModule],
  providers: [SquadService],
  exports: [SquadService]
})
export class SquadModule {}
