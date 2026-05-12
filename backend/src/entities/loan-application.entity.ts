import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("loan_applications")
export class LoanApplication {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column("bigint")
  amountKobo!: string;

  @Column()
  purpose!: string;

  @Column()
  tenor!: string;

  @Column("text")
  revenueSource!: string;

  @Column("text")
  proposal!: string;

  @Column({ default: "under_review" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
