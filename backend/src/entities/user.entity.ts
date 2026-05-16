import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export type UserRole = "trader" | "lender" | "admin";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  businessName?: string;

  @Column({ nullable: true })
  businessType?: string;

  @Column({ nullable: true })
  marketName?: string;

  @Column({ default: "english" })
  language!: string;

  @Column({ default: "trader" })
  role!: UserRole;

  @Column({ nullable: true, select: false })
  passwordHash?: string;

  @Column({ nullable: true })
  archetype?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  ageBracket?: string;

  @Column({ nullable: true })
  bvnLast4?: string;

  @Column({ nullable: true, select: false })
  bvn?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ default: false })
  lenderVisible!: boolean;

  // Worker profile fields — used by the job matching engine
  @Column({ nullable: true, type: "text" })
  bio?: string;

  @Column("simple-array", { nullable: true })
  skills?: string[];

  @Column({ nullable: true })
  workerCategory?: string;

  @Column({ nullable: true, type: "bigint" })
  dailyRateKobo?: number;

  @Column({ nullable: true, type: "float" })
  serviceRadiusKm?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
