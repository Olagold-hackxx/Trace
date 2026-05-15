import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("lender_wallets")
export class LenderWallet {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  userId!: string;

  @Column("bigint", { default: "0" })
  availableKobo!: string;

  @Column("bigint", { default: "0" })
  deployedKobo!: string;

  @Column("bigint", { default: "0" })
  totalDepositedKobo!: string;

  @Column("bigint", { default: "0" })
  totalReturnsKobo!: string;

  @Column({ nullable: true })
  virtualAccountNumber?: string;

  @Column({ nullable: true })
  bankName?: string;

  @Column({ nullable: true })
  squadCustomerId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
