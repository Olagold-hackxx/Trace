import "reflect-metadata";
import { DataSource } from "typeorm";
import { config as loadEnv } from "dotenv";
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
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_NAME ?? "kudiscore",
  entities: [User, VirtualAccount, Transaction, PaymentLink, LoanApplication, LoanOffer, Loan, Job, JobApplication, ScoreSnapshot],
  migrations: ["src/migrations/*.ts"],
  synchronize: process.env.DB_SYNC === "true"
});
