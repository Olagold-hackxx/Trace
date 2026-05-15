import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export type FraudSeverity = "low" | "medium" | "high";
export type FraudStatus   = "open" | "reviewed";

@Entity("fraud_alerts")
export class FraudAlert {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  transactionId?: string;

  @Column()
  userId!: string;

  @Column("float")
  anomalyScore!: number;

  @Column({ default: true })
  isAnomalous!: boolean;

  @Column("text", { array: true, default: [] })
  topSignals!: string[];

  @Column("float", { default: 0 })
  fraudPenalty!: number;

  @Column({ default: "low" })
  severity!: FraudSeverity;

  @Column({ default: "open" })
  status!: FraudStatus;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
