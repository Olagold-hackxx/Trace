import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as loadEnv } from "dotenv";
import { getDatabaseOptions } from "./database/database-options";
import { SnakeNamingStrategy } from "./common/snake-naming-strategy";
import { Job } from "./entities/job.entity";
import { JobApplication } from "./entities/job-application.entity";
import { Loan } from "./entities/loan.entity";
import { LoanApplication } from "./entities/loan-application.entity";
import { LoanOffer } from "./entities/loan-offer.entity";
import { PaymentLink } from "./entities/payment-link.entity";
import { ScoreSnapshot } from "./entities/score-snapshot.entity";
import { Transaction } from "./entities/transaction.entity";
import { User } from "./entities/user.entity";
import { VirtualAccount } from "./entities/virtual-account.entity";

loadEnv();

export default new DataSource({
  type: "postgres",
  ...getDatabaseOptions(process.env),
  namingStrategy: new SnakeNamingStrategy(),
  entities: [User, VirtualAccount, Transaction, PaymentLink, LoanApplication, LoanOffer, Loan, Job, JobApplication, ScoreSnapshot],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: process.env.DB_SYNC === "true"
});
