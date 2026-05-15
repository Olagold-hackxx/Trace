import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionModule } from "../session/session.module";
import { UsersModule } from "../users/users.module";
import { VirtualAccountsModule } from "../virtual-accounts/virtual-accounts.module";

@Module({
  imports: [UsersModule, VirtualAccountsModule, SessionModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
