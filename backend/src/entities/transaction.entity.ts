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

  @Column({ default: "success" })
  status!: string;

  @Column({ type: "jsonb", default: {} })
  rawPayload!: Record<string, unknown>;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  occurredAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
