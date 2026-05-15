import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getDatabaseOptions } from "./database/database-options";
import { SnakeNamingStrategy } from "./common/snake-naming-strategy";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { envValidationSchema } from "./env.validation";
import { HealthModule } from "./health/health.module";
import { JobApplication } from "./entities/job-application.entity";
import { Job } from "./entities/job.entity";
import { LenderWallet } from "./entities/lender-wallet.entity";
import { LoanApplication } from "./entities/loan-application.entity";
import { LoanOffer } from "./entities/loan-offer.entity";
import { Loan } from "./entities/loan.entity";
import { PaymentLink } from "./entities/payment-link.entity";
import { ScoreSnapshot } from "./entities/score-snapshot.entity";
import { Transaction } from "./entities/transaction.entity";
import { User } from "./entities/user.entity";
import { VirtualAccount } from "./entities/virtual-account.entity";
import { Session } from "./entities/session.entity";
import { JobsModule } from "./jobs/jobs.module";
import { LenderModule } from "./lender/lender.module";
import { LoansModule } from "./loans/loans.module";
import { PaymentsModule } from "./payments/payments.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { RedisModule } from "./redis/redis.module";
import { ScoreModule } from "./score/score.module";
import { SessionModule } from "./session/session.module";
import { SquadModule } from "./squad/squad.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { UsersModule } from "./users/users.module";
import { VirtualAccountsModule } from "./virtual-accounts/virtual-accounts.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      validationSchema: envValidationSchema
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbSync = configService.get<string | boolean>("DB_SYNC");

        return {
          type: "postgres",
          ...getDatabaseOptions(configService),
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: dbSync === true || dbSync === "true",
          autoLoadEntities: false,
          entities: [User, VirtualAccount, Transaction, PaymentLink, LoanApplication, LoanOffer, Loan, Job, JobApplication, ScoreSnapshot, Session, LenderWallet]
        };
      }
    }),
    RedisModule,
    SessionModule,
    RealtimeModule,
    SquadModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VirtualAccountsModule,
    PaymentsModule,
    TransactionsModule,
    ScoreModule,
    LoansModule,
    JobsModule,
    LenderModule,
    AdminModule,
    WebhooksModule
  ]
})
export class AppModule {}
