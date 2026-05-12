import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("loan_offers")
export class LoanOffer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column()
  lenderName!: string;

  @Column("bigint")
  amountKobo!: string;

  @Column()
  rateLabel!: string;

  @Column()
  tenorLabel!: string;

  @Column()
  monthlyRepaymentLabel!: string;

  @Column({ default: "available" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
