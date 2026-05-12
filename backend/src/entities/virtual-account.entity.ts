import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("virtual_accounts")
export class VirtualAccount {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  squadCustomerId?: string;

  @Column({ unique: true })
  accountNumber!: string;

  @Column({ default: "GTBank" })
  bankName!: string;

  @Column({ default: "active" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
