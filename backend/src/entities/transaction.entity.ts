import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column({ unique: true })
  reference!: string;

  @Column()
  type!: string;

  @Column("bigint")
  amountKobo!: string;

  @Column({ nullable: true })
  senderName?: string;

  @Column({ nullable: true })
  senderAccount?: string;

  @Column({ nullable: true })
  maskedSenderAccountNumber?: string;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  remarks?: string;

  @Column({ nullable: true })
  channel?: string;

  @Column({ nullable: true })
  transactionIndicator?: string;

  @Column({ nullable: true })
  virtualAccountNumber?: string;

  @Column("bigint", { nullable: true })
  settledAmountKobo?: string;

  @Column("bigint", { nullable: true })
  principalAmountKobo?: string;

  @Column({ default: "success" })
  status!: string;

  @Column({ type: "jsonb", default: {} })
  rawPayload!: Record<string, unknown>;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  occurredAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
