import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("loans")
export class Loan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  offerId?: string;

  @Column()
  lenderName!: string;

  @Column("bigint")
  principalKobo!: string;

  @Column("bigint", { default: "0" })
  amountRepaidKobo!: string;

  @Column()
  rateLabel!: string;

  @Column()
  tenorLabel!: string;

  @Column({ default: "cash_flow_indexed" })
  repaymentMethod!: string;

  @Column({ default: "5%" })
  repaymentPctLabel!: string;

  @Column({ default: "active" })
  status!: string;

  @Column({ nullable: true })
  nextDueDate?: string;

  @Column({ nullable: true })
  squadPayoutRef?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
