import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VirtualAccount } from "../entities/virtual-account.entity";
import { SquadModule } from "../squad/squad.module";
import { UsersModule } from "../users/users.module";
import { VirtualAccountsController } from "./virtual-accounts.controller";
import { VirtualAccountsService } from "./virtual-accounts.service";

@Module({
  imports: [TypeOrmModule.forFeature([VirtualAccount]), UsersModule, SquadModule],
  controllers: [VirtualAccountsController],
  providers: [VirtualAccountsService],
  exports: [VirtualAccountsService]
})
export class VirtualAccountsModule {}
